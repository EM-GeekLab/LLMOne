export type ScriptGeneratorParams = Record<string, string>

export function generateScript(params: ScriptGeneratorParams) {
  // commit: 4b7161c4e3865d197756316176c884338ff99dbf
  const script = `#!/bin/busybox sh
: "\${DISK:?}"
: "\${ROOTFS_URL:?}"

umount -R /mnt
# create partitions
parted "$DISK" --fix --script 'mklabel gpt'
parted "$DISK" --fix --script --align 'optimal' 'mkpart primary fat32 1MiB 512MiB'
parted "$DISK" --fix --script --align 'optimal' 'mkpart primary ext4 512MiB 100%'
parted "$DISK" --fix --script 'set 1 esp on'
DISK_INFO="$(parted "$DISK" --script 'print' -j)"
EFI_PARTUUID="$(echo "$DISK_INFO" | jq '.disk.partitions[0].uuid' -r)"
ROOTFS_PARTUUID="$(echo "$DISK_INFO" | jq '.disk.partitions[1].uuid' -r)"
EFI_PATH="/dev/disk/by-partuuid/\${EFI_PARTUUID}"
ROOTFS_PATH="/dev/disk/by-partuuid/\${ROOTFS_PARTUUID}"
mkfs.vfat -F 32 -n EFI "$EFI_PATH"
mkfs.ext4 -L rootfs "$ROOTFS_PATH"
partprobe "$DISK"
# mount partitions
mount "$ROOTFS_PATH" /mnt -t ext4
mkdir -p /mnt/boot/efi
mount "$EFI_PATH" /mnt/boot/efi -t vfat

# installation
mkdir -p /installer_tmp &&
mount -t tmpfs tmpfs /installer_tmp -o size=8G && 
cd /installer_tmp || exit 1

wget "$ROOTFS_URL" -O image.tar.zst
wget "$ROOTFS_URL.sha1" -O image.tar.zst.sha1

if ! sha1sum -c image.tar.zst.sha1 < image.tar.zst; then
  echo "SHA1 checksum failed"
  cd / && umount /installer_tmp && rm -rf /installer_tmp
  exit 1
fi

tar xf image.tar.zst -C /mnt --preserve-permissions --same-owner --zstd

cd / &&
umount /installer_tmp &&
rm -rf /installer_tmp

# Prepare chroot envrionment mount special filesystems
mkdir -p /mnt/tmp /mnt/proc /mnt/sys /mnt/dev /mnt/dev/pts
mount -t tmpfs tmpfs /mnt/tmp
mount -t proc none /mnt/proc
mount -t sysfs none /mnt/sys
mount -t devtmpfs none /mnt/dev
mount -t devpts none /mnt/dev/pts
mount -t efivarfs none /mnt/sys/firmware/efi/efivars

cat <<EOF > /mnt/etc/fstab
PARTUUID=\${ROOTFS_PARTUUID} / ext4 defaults 0 1
PARTUUID=\${EFI_PARTUUID} /boot/efi vfat defaults 0 2
EOF

chroot /mnt sh -c 'update-initramfs -c -k all && grub-install --target=x86_64-efi --efi-directory=/boot/efi --recheck && update-grub'
chroot /mnt sh -c 'ln -rs /usr/lib/systemd/systemd /sbin/init'
`

  return script
}
