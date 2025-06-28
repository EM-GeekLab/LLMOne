import { match } from 'ts-pattern'

export type PackageManagerType = 'apt' | 'yum' | 'dnf' | 'pacman' | 'zypper' | 'apk' | 'emerge' | 'nix-env'

export class PackageManager {
  readonly type: PackageManagerType

  constructor(type: PackageManagerType) {
    this.type = type
    this.packageNameMapping = this.packageNameMapping.bind(this)
  }

  packageNameMapping(name: string) {
    switch (name) {
      case 'aria2':
        return match(this.type)
          .with('emerge', () => 'net-misc/aria2')
          .with('nix-env', () => 'nixpkgs.aria2')
          .otherwise(() => 'aria2')
      case 'jq':
        return match(this.type)
          .with('emerge', () => 'app-misc/jq')
          .with('nix-env', () => 'nixpkgs.jq')
          .otherwise(() => 'jq')
      case 'zstd':
        return match(this.type)
          .with('emerge', () => 'app-arch/zstd')
          .with('nix-env', () => 'nixpkgs.zstd')
          .otherwise(() => 'zstd')
      case 'curl':
        return match(this.type)
          .with('emerge', () => 'net-misc/curl')
          .with('nix-env', () => 'nixpkgs.curl')
          .otherwise(() => 'curl')
      default:
        return name
    }
  }

  install(...packageName: string[]) {
    const packages = packageName.map(this.packageNameMapping).join(' ')
    match(this.type)
      .with('apt', () => `apt-get install -y ${packages}`)
      .with('yum', () => `yum install -y ${packages}`)
      .with('dnf', () => `dnf install -y ${packages}`)
      .with('pacman', () => `pacman -S --noconfirm ${packages}`)
      .with('zypper', () => `zypper install -y ${packages}`)
      .with('apk', () => `apk add ${packages}`)
      .with('emerge', () => `emerge --ask=n ${packages}`)
      .with('nix-env', () => `nix-env -iA ${packages}`)
  }

  uninstall(...packageName: string[]) {
    const packages = packageName.map(this.packageNameMapping).join(' ')
    match(this.type)
      .with('apt', () => `apt-get remove -y ${packages}`)
      .with('yum', () => `yum remove -y ${packages}`)
      .with('dnf', () => `dnf remove -y ${packages}`)
      .with('pacman', () => `pacman -R --noconfirm ${packages}`)
      .with('zypper', () => `zypper remove -y ${packages}`)
      .with('apk', () => `apk del ${packages}`)
      .with('emerge', () => `emerge --unmerge --ask=n ${packages}`)
      .with('nix-env', () => `nix-env -e ${packages}`)
  }

  updateSource() {
    return String.raw`source <(curl -sSL https://gitee.com/SuperManito/LinuxMirrors/raw/main/ChangeMirrors.sh) \
--source mirrors.aliyun.com \
--protocol http \
--use-intranet-source false \
--install-epel true \
--backup true \
--upgrade-software false \
--clean-cache false \
--ignore-backup-tips \
--pure-mode`
  }

  installDocker() {
    return String.raw`source <(curl -sSL https://gitee.com/SuperManito/LinuxMirrors/raw/main/DockerInstallation.sh) \
--source mirrors.aliyun.com/docker-ce \
--source-registry registry.hub.docker.com \
--protocol http \
--install-latest true \
--close-firewall true \
--ignore-backup-tips \
--pure-mode`
  }
}
