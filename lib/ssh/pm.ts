import { match } from 'ts-pattern'

export type PackageManagerType = 'apt' | 'yum' | 'dnf' | 'pacman' | 'zypper'

export class PackageManager {
  readonly type: PackageManagerType

  constructor(type: PackageManagerType) {
    this.type = type
    this.packageNameMapping = this.packageNameMapping.bind(this)
  }

  packageNameMapping(name: string) {
    switch (name) {
      default:
        return name
    }
  }

  install(...packageName: string[]) {
    const packages = packageName.map(this.packageNameMapping).join(' ')
    return match(this.type)
      .with('apt', () => `apt-get install -y ${packages}`)
      .with('yum', () => `yum install -y ${packages}`)
      .with('dnf', () => `dnf install -y ${packages}`)
      .with('pacman', () => `pacman -S --noconfirm ${packages}`)
      .with('zypper', () => `zypper install -y ${packages}`)
      .exhaustive()
  }

  uninstall(...packageName: string[]) {
    const packages = packageName.map(this.packageNameMapping).join(' ')
    return match(this.type)
      .with('apt', () => `apt-get remove -y ${packages}`)
      .with('yum', () => `yum remove -y ${packages}`)
      .with('dnf', () => `dnf remove -y ${packages}`)
      .with('pacman', () => `pacman -R --noconfirm ${packages}`)
      .with('zypper', () => `zypper remove -y ${packages}`)
      .exhaustive()
  }

  updateSources() {
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
