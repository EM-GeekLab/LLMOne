import { logger } from '@/lib/logger'

import type { Mxc } from '.'
import { configToYaml, type NetplanConfiguration } from './netplan'
import type { OperationError } from './types'

const log = logger.child({ module: 'mxlite/deployer' })

export type DeployStage =
  | 'Pending'
  | 'Preinstalling'
  | 'Preinstalled'
  | 'Downloading'
  | 'Downloaded'
  | 'Installing'
  | 'Installed'
  | 'Postinstalling'
  | 'Postinstalled'
  | 'Failed'
export type DeployerError = 'Ok' | 'FailedToExec' | 'ReturnTypeMismatch' | 'ExecError'

const PREINSTALL_SCRIPT = `umount -R /mnt
parted "$DISK" --fix --script 'mklabel gpt'
parted "$DISK" --fix --script --align 'optimal' 'mkpart primary fat32 1MiB 512MiB'
parted "$DISK" --fix --script --align 'optimal' 'mkpart primary ext4 512MiB 100%'
parted "$DISK" --fix --script 'set 1 esp on'
DISK_INFO="$(parted "$DISK" --script 'print' -j)"
EFI_PARTUUID="$(echo "$DISK_INFO" | jq '.disk.partitions[0].uuid' -r)"
ROOTFS_PARTUUID="$(echo "$DISK_INFO" | jq '.disk.partitions[1].uuid' -r)"
EFI_PATH="/dev/disk/by-partuuid/$EFI_PARTUUID"
ROOTFS_PATH="/dev/disk/by-partuuid/$ROOTFS_PARTUUID"
mkfs.vfat -F 32 -n EFI "$EFI_PATH"
mkfs.ext4 -L rootfs "$ROOTFS_PATH"
partprobe "$DISK"
# mount partitions
mount "$ROOTFS_PATH" /mnt -t ext4
mkdir -p /mnt/boot/efi
mount "$EFI_PATH" /mnt/boot/efi -t vfat
mkdir -p /installer_tmp &&
mount -t tmpfs tmpfs /installer_tmp -o size=8G`

const POSTINSTALL_SCRIPT = `cd / &&
umount /installer_tmp &&
rm -rf /installer_tmp

DISK_INFO="$(parted "$DISK" --script 'print' -j)"
EFI_PARTUUID="$(echo "$DISK_INFO" | jq '.disk.partitions[0].uuid' -r)"
ROOTFS_PARTUUID="$(echo "$DISK_INFO" | jq '.disk.partitions[1].uuid' -r)"

# Prepare chroot envrionment mount special filesystems
mkdir -p /mnt/tmp /mnt/proc /mnt/sys /mnt/dev /mnt/dev/pts
mount -t tmpfs tmpfs /mnt/tmp
mount -t proc none /mnt/proc
mount -t sysfs none /mnt/sys
mount -t devtmpfs none /mnt/dev
mount -t devpts none /mnt/dev/pts
mount -t efivarfs none /mnt/sys/firmware/efi/efivars

cat <<EOF > /mnt/etc/fstab
PARTUUID=$ROOTFS_PARTUUID / ext4 defaults 0 1
PARTUUID=$EFI_PARTUUID /boot/efi vfat defaults 0 2
EOF

chroot /mnt sh -c 'update-initramfs -c -k all && grub-install --target=x86_64-efi --efi-directory=/boot/efi --recheck && update-grub'
chroot /mnt sh -c 'ln -frs /usr/lib/systemd/systemd /sbin/init'`

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

export class Deployer {
  private mxc: Mxc
  private readonly hostId: string
  private readonly diskName: string
  private readonly rootfsUrl: string

  constructor(mxc: Mxc, hostId: string, diskName: string, rootfsUrl: string) {
    this.mxc = mxc
    this.hostId = hostId
    this.diskName = diskName
    this.rootfsUrl = rootfsUrl
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
      log.info({ meta: 'Command execution stdout' }, r2.payload.payload.stdout)
    }
    if (r2.payload.payload.stderr.length > 0) {
      log.info({ meta: 'Command execution stderr' }, r2.payload.payload.stderr)
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

  public async preinstall() {
    const script = `export DISK="${this.diskName}";
${PREINSTALL_SCRIPT}`
    await this.execScript(script)
  }

  public async downloadRootfs() {
    await this.downloadFile(this.rootfsUrl, '/installer_tmp/image.tar.zst')
  }

  public async install() {
    const script = 'cd /installer_tmp && tar xf image.tar.zst -C /mnt --preserve-permissions --same-owner --zstd'
    await this.execScript(script)
  }

  public async postinstall() {
    const script = `export DISK="${this.diskName}";
${POSTINSTALL_SCRIPT}
`
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
    await this.execScript('reboot')
  }

  private async execScriptChroot(inner: string) {
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
    const sources_ = sources ?? {
      'ubuntu.sources': `Types: deb
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
}
