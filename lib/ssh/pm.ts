/**
 * Copyright (c) 2025 EM-GeekLab
 * LLMOne is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { match } from 'ts-pattern'

export type PackageManagerType = 'apt' | 'yum' | 'dnf' | 'pacman' | 'zypper'

export type PackageMirrors =
  | 'mirrors.aliyun.com'
  | 'mirrors.tencent.com'
  | 'mirrors.tuna.tsinghua.edu.cn'
  | 'mirrors.ustc.edu.cn'

export type DockerPackageMirrors =
  | 'mirrors.aliyun.com/docker-ce'
  | 'mirrors.tencent.com/docker-ce'
  | 'mirrors.tuna.tsinghua.edu.cn/docker-ce'
  | 'mirrors.ustc.edu.cn/docker-ce'
  | 'download.docker.com'

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

  updateIndex() {
    return match(this.type)
      .with('apt', () => 'apt-get update')
      .with('yum', () => 'yum makecache')
      .with('dnf', () => 'dnf makecache')
      .with('pacman', () => 'pacman -Sy')
      .with('zypper', () => 'zypper refresh')
      .exhaustive()
  }

  updateSources(mirror: PackageMirrors = 'mirrors.aliyun.com') {
    return String.raw`source <(curl -sSL https://gitee.com/SuperManito/LinuxMirrors/raw/main/ChangeMirrors.sh) \
--source ${mirror} \
--protocol http \
--use-intranet-source false \
--install-epel true \
--backup true \
--upgrade-software false \
--clean-cache false \
--ignore-backup-tips \
--pure-mode`
  }

  installDocker(mirror: DockerPackageMirrors = 'mirrors.aliyun.com/docker-ce') {
    return String.raw`source <(curl -sSL https://gitee.com/SuperManito/LinuxMirrors/raw/main/DockerInstallation.sh) \
--source ${mirror} \
--source-registry registry.hub.docker.com \
--protocol http \
--use-intranet-source false \
--install-latest true \
--close-firewall true \
--ignore-backup-tips \
--pure-mode`
  }

  installNvidiaDriver() {
    return String.raw`source <(curl -sSL https://gitee.com/EM_GeekLab/nvidia-driver-installer/raw/main/nvidia-install.sh) -y`
  }

  installNvidiaContainerToolkit() {
    return String.raw`source <(curl -sSL https://gitee.com/EM_GeekLab/nvidia-driver-installer/raw/main/nvidia-container-installer.sh) -y --china-mirror`
  }
}
