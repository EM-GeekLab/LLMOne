import type { Mxc, OperationError } from '.'

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
chroot /mnt sh -c 'ln -rs /usr/lib/systemd/systemd /sbin/init'`

export class Deployer {
  private mxc: Mxc
  private stage: DeployStage
  private hostId: string
  private disk_name: string
  private rootfs_url: string

  constructor(mxc: Mxc, hostId: string, disk_name: string, rootfs_url: string) {
    this.mxc = mxc
    this.stage = 'Pending'
    this.hostId = hostId
    this.disk_name = disk_name
    this.rootfs_url = rootfs_url
  }

  private async exec_script(script: string): Promise<{
    error: DeployerError
    reason?: OperationError
  }> {
    const [r] = await this.mxc.commandExec(this.hostId, script)
    if (!r.ok) {
      return {
        error: 'FailedToExec',
        reason: r.reason,
      }
    }
    const task_id = r.task_id
    const r2 = await this.mxc.blockUntilTaskComplete(this.hostId, task_id, 100)
    if (!r2.ok) {
      return {
        error: 'FailedToExec',
        reason: r2.reason,
      }
    }
    if (r2.payload.payload.type !== 'CommandExecutionResponse') {
      return {
        error: 'ReturnTypeMismatch',
      }
    }
    if (r2.payload.payload.code !== 0) {
      return {
        error: 'ExecError',
      }
    }
    return {
      error: 'Ok',
    }
  }

  public async preinstall(): Promise<{
    error: DeployerError
    reason?: OperationError
  }> {
    if (this.stage !== 'Pending') {
      throw new Error(`StageError: ${this.stage}`)
    }
    this.stage = 'Preinstalling'
    const script = `export DISK="${this.disk_name}";
${PREINSTALL_SCRIPT}`

    const r = await this.exec_script(script)
    if (r.error === 'Ok') {
      this.stage = 'Preinstalled'
    }
    return r
  }

  public async download_rootfs(): Promise<{
    error: DeployerError
    reason?: OperationError
  }> {
    if (this.stage !== 'Preinstalled') {
      throw new Error(`StageError: ${this.stage}`)
    }
    this.stage = 'Downloading'
    const [r] = await this.mxc.downloadFile(this.hostId, this.rootfs_url, '/installer_tmp/image.tar.zst')
    if (!r.ok) {
      return {
        error: 'FailedToExec',
        reason: r.reason,
      }
    }
    const task_id = r.task_id
    const r2 = await this.mxc.blockUntilTaskComplete(this.hostId, task_id, 100)
    if (!r2.ok) {
      return {
        error: 'FailedToExec',
        reason: r2.reason,
      }
    }
    if (r2.payload.payload.type !== 'FileOperationResponse') {
      return {
        error: 'ReturnTypeMismatch',
      }
    }
    if (!r2.payload.payload.success) {
      return {
        error: 'ExecError',
      }
    }
    if (r2.payload.payload.hash !== null) {
      // TODO: perform xxh3 hash check here
    }
    this.stage = 'Downloaded'
    return {
      error: 'Ok',
    }
  }

  public async install(): Promise<{
    error: DeployerError
    reason?: OperationError
  }> {
    if (this.stage !== 'Downloaded') {
      throw new Error(`StageError: ${this.stage}`)
    }
    this.stage = 'Installing'
    const script = 'cd /installer_tmp && tar xf image.tar.zst -C /mnt --preserve-permissions --same-owner --zstd'

    const r = await this.exec_script(script)
    if (r.error === 'Ok') {
      this.stage = 'Installed'
    }
    return r
  }

  public async postinstall(): Promise<{
    error: DeployerError
    reason?: OperationError
  }> {
    if (this.stage !== 'Installed') {
      throw new Error(`StageError: ${this.stage}`)
    }
    this.stage = 'Postinstalling'
    const script = `export DISK="${this.disk_name}";
${POSTINSTALL_SCRIPT}
`
    const r = await this.exec_script(script)
    if (r.error === 'Ok') {
      this.stage = 'Postinstalled'
    }
    return r
  }

  public async apply_netplan() {
    if (this.stage !== 'Postinstalled') {
      throw new Error(`StageError: ${this.stage}`)
    }
    // TODO: apply netplan
  }

  public async apply_userconfig() {
    if (this.stage !== 'Postinstalled') {
      throw new Error(`StageError: ${this.stage}`)
    }
    // TODO: apply userconfig
  }
}
