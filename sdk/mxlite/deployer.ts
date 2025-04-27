import { logger } from '@/lib/logger'

import type { Mxc } from '.'
import { configToYaml, type NetplanConfiguration } from './netplan'
import type { OperationError } from './types'

const log = logger.child({ module: 'mxlite.deployer' })

export type DeployerError = 'Ok' | 'FailedToExec' | 'ReturnTypeMismatch' | 'ExecError' | 'Timeout'

class DeployError extends Error {
  public reason?: OperationError

  constructor({ error, reason }: { error: DeployerError; reason?: OperationError }) {
    super(error)
    this.name = error
    this.reason = reason
    if (reason) {
      this.message = `${error}: ${reason}`
    } else {
      this.message = error
    }
  }
}

export type Distro = (
  | {
      distro: 'debian-like'
      release: 'bookworm' | 'noble' | 'jammy'
    }
  | {
      distro: 'fedora-like'
      release: 'f42'
    }
) & {
  arch: 'x86_64' | 'arm64'
}

export class SystemDeployer {
  private readonly mxc: Mxc
  private readonly hostId: string
  private readonly diskName: string
  private readonly rootfsUrl: string
  private readonly distro: Distro

  constructor(mxc: Mxc, hostId: string, diskName: string, rootfsUrl: string, distro: Distro) {
    this.mxc = mxc
    this.hostId = hostId
    this.diskName = diskName
    this.rootfsUrl = rootfsUrl
    this.distro = distro
  }

  private async execScript(script: string) {
    const [r] = await this.mxc.commandExec(this.hostId, script)
    if (!r.ok) {
      throw new DeployError({
        error: 'FailedToExec',
        reason: r.reason,
      })
    }
    const taskId = r.task_id
    const r2 = await this.mxc.blockUntilTaskComplete(this.hostId, taskId, 100)
    if (!r2.ok) {
      throw new DeployError({
        error: 'FailedToExec',
        reason: r2.reason,
      })
    }
    if (r2.payload.payload.type !== 'CommandExecutionResponse') {
      throw new DeployError({
        error: 'ReturnTypeMismatch',
      })
    }
    if (r2.payload.payload.code !== 0) {
      log.error(r2.payload.payload, 'Command execution failed')
      throw new DeployError({
        error: 'ExecError',
      })
    }
    if (r2.payload.payload.stdout.length > 0) {
      log.info({ stdout: r2.payload.payload.stdout }, 'Command execution stdout')
      if (process.env.NODE_ENV !== 'production') console.log(r2.payload.payload.stdout)
    }
    if (r2.payload.payload.stderr.length > 0) {
      log.info({ stderr: r2.payload.payload.stderr }, 'Command execution stderr')
      if (process.env.NODE_ENV !== 'production') console.error(r2.payload.payload.stderr)
    }
    return {
      stdout: r2.payload.payload.stdout,
      stderr: r2.payload.payload.stderr,
    }
  }

  private async downloadFile(url: string, path: string, xxh3?: string) {
    const [r] = await this.mxc.downloadFile(this.hostId, url, path)
    if (!r.ok) {
      throw new DeployError({
        error: 'FailedToExec',
        reason: r.reason,
      })
    }
    const taskId = r.task_id
    const r2 = await this.mxc.blockUntilTaskComplete(this.hostId, taskId, 100)
    if (!r2.ok) {
      throw new DeployError({
        error: 'FailedToExec',
        reason: r2.reason,
      })
    }
    if (r2.payload.payload.type !== 'FileOperationResponse') {
      throw new DeployError({
        error: 'ReturnTypeMismatch',
      })
    }
    if (!r2.payload.payload.success) {
      throw new DeployError({
        error: 'ExecError',
      })
    }
    if (r2.payload.payload.hash !== null && !!xxh3) {
      if (r2.payload.payload.hash !== xxh3) {
        throw new DeployError({
          error: 'ExecError',
        })
      }
    }
  }

  public async waitUntilReady({
    skipSessionId,
    interval = 2000,
    timeout = 40 * 60 * 1000,
  }: {
    interval?: number
    timeout?: number
    skipSessionId?: string
  } = {}) {
    let _timeout = timeout
    while (true) {
      const [res, status] = await this.mxc.getHostInfo(this.hostId).catch((err) => {
        log.error(err, 'Failed to get host info')
        throw new DeployError({
          error: 'FailedToExec',
          reason: 'INTERNAL_ERROR',
        })
      })
      if (res.ok && status < 400 && res.info.session_id !== skipSessionId) {
        break
      }
      if (_timeout > 0) {
        _timeout -= interval
        if (_timeout <= 0) {
          throw new DeployError({
            error: 'Timeout',
          })
        }
      }
      await new Promise((resolve) => setTimeout(resolve, interval))
    }
  }

  public async preinstall() {
    const script = String.raw`export DISK="${this.diskName}";
umount -R /mnt || true
parted "$DISK" --fix --script --align optimal mklabel gpt \
  mkpart primary fat32 1MiB 512MiB \
  mkpart primary ext4 512MiB 2048MiB \
  mkpart primary ext4 2048MiB 100% \
  set 1 esp on \
  print || exit 1
partprobe "$DISK"
mdev -s

DISK_INFO="$(parted "$DISK" --script 'print' -j)"
EFI_PARTUUID="$(echo "$DISK_INFO" | jq '.disk.partitions[0].uuid' -r)"
BOOT_PARTUUID="$(echo "$DISK_INFO" | jq '.disk.partitions[1].uuid' -r)"
ROOTFS_PARTUUID="$(echo "$DISK_INFO" | jq '.disk.partitions[2].uuid' -r)"
EFI_PATH="/dev/disk/by-partuuid/$EFI_PARTUUID"
BOOT_PATH="/dev/disk/by-partuuid/$BOOT_PARTUUID"
ROOTFS_PATH="/dev/disk/by-partuuid/$ROOTFS_PARTUUID"

mkfs.vfat -F 32 -n EFI "$EFI_PATH" || exit 1
mkfs.ext4 -O ^metadata_csum_seed -O ^orphan_file -L boot "$BOOT_PATH" || exit 1
mkfs.ext4 -O ^orphan_file -L rootfs "$ROOTFS_PATH" || exit 1

mount "$ROOTFS_PATH" /mnt -t ext4 || exit 1
mkdir -p /mnt/boot
mount "$BOOT_PATH" /mnt/boot -t ext4 || exit 1
mkdir -p /mnt/boot/efi
mount "$EFI_PATH" /mnt/boot/efi -t vfat || exit 1
`
    await this.execScript(script)
  }

  public async downloadRootfs() {
    await this.downloadFile(this.rootfsUrl, '/image.tar.zst')
  }

  public async install() {
    const script = 'tar xf /image.tar.zst -C /mnt --preserve-permissions --same-owner --zstd'
    await this.execScript(script)
  }

  public async postinstall() {
    let script = String.raw`export DISK="${this.diskName}";
# Prepare chroot envrionment mount special filesystems
mkdir -p /mnt/tmp /mnt/proc /mnt/sys /mnt/dev /mnt/dev/pts
mount -t tmpfs tmpfs /mnt/tmp
mount -t proc none /mnt/proc
mount -t sysfs none /mnt/sys
mount -t devtmpfs none /mnt/dev
mount -t devpts none /mnt/dev/pts
mount -t efivarfs none /mnt/sys/firmware/efi/efivars

DISK_INFO="$(parted "$DISK" --script 'print' -j)"
EFI_PARTUUID="$(echo "$DISK_INFO" | jq '.disk.partitions[0].uuid' -r)"
BOOT_PARTUUID="$(echo "$DISK_INFO" | jq '.disk.partitions[1].uuid' -r)"
ROOTFS_PARTUUID="$(echo "$DISK_INFO" | jq '.disk.partitions[2].uuid' -r)"

cat << EOF > /mnt/etc/fstab
PARTUUID=$ROOTFS_PARTUUID / ext4 defaults 0 1
PARTUUID=$BOOT_PARTUUID /boot ext4 defaults 0 2
PARTUUID=$EFI_PARTUUID /boot/efi vfat defaults 0 2
EOF
`

    if (this.distro.distro === 'debian-like') {
      script += String.raw`
chroot /mnt sh << END_OF_SCRIPT
update-initramfs -c -k all || exit 1
grub-install --efi-directory=/boot/efi --recheck && update-grub || exit 1
END_OF_SCRIPT
`
    } else {
      throw new Error('Not implemented yet')
    }
    await this.execScript(script)
  }

  public async applyNetplan(config: NetplanConfiguration, confName = '00-default.yaml') {
    const script = `mkdir -p /mnt/etc/netplan && cat <<EOFEOFEOF > /mnt/etc/netplan/${confName}
${configToYaml(config)}
EOFEOFEOF
chmod 400 /mnt/etc/netplan/${confName}`
    await this.execScript(script)
  }

  public async reboot() {
    await this.execScript('reboot').catch(() => undefined)
  }

  public async shutdown() {
    await this.execScript('shutdown').catch(() => undefined)
  }

  public async execScriptChroot(inner: string) {
    const script = `chroot /mnt bash << EOFEOFEOF
${inner}
EOFEOFEOF`
    await this.execScript(script)
  }

  public async applyUserconfig(username: string, password: string) {
    let script = `echo "root:${password}" | chpasswd`
    if (username !== 'root') {
      script += `
useradd -m -G sudo -s /bin/bash ${username} || true
echo "${username}:${password}" | chpasswd
`
    }
    await this.execScriptChroot(script)
  }

  public async applyHostname(hostname: string) {
    await this.execScriptChroot(`echo "${hostname}" > /etc/hostname`)
  }

  public async applyAptSources(sources?: Record<string, string>) {
    if (this.distro.distro !== 'debian-like') {
      throw new Error('Not supported distro')
    }
    const sources_ =
      sources ??
      (((variant) => {
        switch (variant) {
          case 'noble':
            return {
              'ubuntu.sources': String.raw`Types: deb
URIs: http://cn.archive.ubuntu.com/ubuntu/
Suites: noble noble-updates noble-backports
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg

Types: deb
URIs: http://security.ubuntu.com/ubuntu/
Suites: noble-security
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
`,
            }
          case 'jammy':
            return {
              'ubuntu.sources': String.raw`deb http://cn.archive.ubuntu.com/ubuntu/ jammy main restricted universe multiverse
deb http://cn.archive.ubuntu.com/ubuntu/ jammy-updates main restricted universe multiverse
deb http://cn.archive.ubuntu.com/ubuntu/ jammy-backports main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu/ jammy-security main restricted universe multiverse
`,
            }
          default:
            throw new Error('Not implemented yet')
        }
      })(this.distro.release) as Record<string, string>)
    let script = `
rm /etc/apt/sources.list.d/*
cat <<EOF > /etc/apt/sources.list
# Moved to sources.list.d
EOF
`
    for (const filename in sources_) {
      const content = sources_[filename]
      script += `
cat <<EOF > /etc/apt/sources.list.d/${filename}
${content}
EOF
`
    }
    log.info({ script }, 'apply apt sources')
    await this.execScriptChroot(script)
  }

  public async applyModprobeConfigs() {
    const script = `cat <<EOF >> /etc/modprobe.d/blacklist.conf
blacklist nouveau
EOF
`
    await this.execScriptChroot(script)
  }

  public async applyCustomPackage(packageUrl: string) {
    const script = `
INSTALLER_TEMP=$(mktemp -d /tmp/installer.XXXXXX)
cd "$INSTALLER_TEMP" || exit 1
curl -Ls "${packageUrl}" | tar x --zstd
if [ -f ./install.sh ]; then
  chmod +x ./install.sh
  export DEBIAN_FRONTEND=noninteractive
  ./install.sh
else
  echo "No install.sh found in the package."
fi
cd / && rm -rf "$INSTALLER_TEMP"
`

    await this.execScript(script)
  }
}
