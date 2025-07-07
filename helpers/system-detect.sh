#!/bin/bash

# Copyright (c) 2025 EM-GeekLab
# LLMOne is licensed under Mulan PSL v2.
# You can use this software according to the terms and conditions of the Mulan PSL v2.
# You may obtain a copy of Mulan PSL v2 at:
#          http://license.coscl.org.cn/MulanPSL2
# THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
# EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
# MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
# See the Mulan PSL v2 for more details.

## 定义系统判定变量
SYSTEM_DEBIAN="Debian"
SYSTEM_UBUNTU="Ubuntu"
SYSTEM_KALI="Kali"
SYSTEM_DEEPIN="Deepin"
SYSTEM_LINUX_MINT="Linuxmint"
SYSTEM_ZORIN="Zorin"
SYSTEM_RASPBERRY_PI_OS="Raspberry Pi OS"
SYSTEM_REDHAT="RedHat"
SYSTEM_RHEL="Red Hat Enterprise Linux"
SYSTEM_CENTOS="CentOS"
SYSTEM_CENTOS_STREAM="CentOS Stream"
SYSTEM_ROCKY="Rocky"
SYSTEM_ALMALINUX="AlmaLinux"
SYSTEM_FEDORA="Fedora"
SYSTEM_OPENCLOUDOS="OpenCloudOS"
SYSTEM_OPENEULER="openEuler"
SYSTEM_ANOLISOS="Anolis"
SYSTEM_OPENKYLIN="openKylin"
SYSTEM_OPENSUSE="openSUSE"
SYSTEM_ARCH="Arch"
SYSTEM_MANJARO="Manjaro"
SYSTEM_ALPINE="Alpine"
SYSTEM_GENTOO="Gentoo"
SYSTEM_NIXOS="NixOS"

## 定义系统版本文件
File_LinuxRelease=/etc/os-release
File_RedHatRelease=/etc/redhat-release
File_DebianVersion=/etc/debian_version
File_ArmbianRelease=/etc/armbian-release
File_RaspberryPiOSRelease=/etc/rpi-issue
File_openEulerRelease=/etc/openEuler-release
File_OpenCloudOSRelease=/etc/opencloudos-release
File_AnolisOSRelease=/etc/anolis-release
File_OracleLinuxRelease=/etc/oracle-release
File_ArchLinuxRelease=/etc/arch-release
File_ManjaroRelease=/etc/manjaro-release
File_AlpineRelease=/etc/alpine-release
File_GentooRelease=/etc/gentoo-release
File_openKylinVersion=/etc/kylin-version/kylin-system-version.conf

## 报错退出函数
function output_error() {
    # 将错误信息输出到标准错误流
    echo "$1" >&2
    exit 1
}

## 收集系统信息 (源自原始脚本，并进行精简)
function detect_system_info() {
    ## 权限判定
    if [ $UID -eq 0 ]; then
        # 如果是root用户，则定义一个空实现，因为lsb-release安装可能需要权限
        # 在这个脚本的上下文中，我们假设必要的工具已经存在或只进行检测
        :
    fi

    if [[ "$(uname -s)" == *"Darwin"* ]]; then
      output_error "暂不支持操作系统 macOS (Darwin)"
    fi
    
    ## 定义系统ID
    SYSTEM_ID="$(cat $File_LinuxRelease | grep -E "^ID=" | awk -F '=' '{print$2}' | sed "s/[\'\"]//g")"
    ## 判定当前系统派系
    if [ -s "${File_DebianVersion}" ]; then
        SYSTEM_FACTIONS="${SYSTEM_DEBIAN}"
    elif [ -s "${File_OracleLinuxRelease}" ]; then
        output_error "不支持操作系统 Oracle Linux"
    elif [ -s "${File_RedHatRelease}" ]; then
        SYSTEM_FACTIONS="${SYSTEM_REDHAT}"
    elif [ -s "${File_openEulerRelease}" ]; then
        SYSTEM_FACTIONS="${SYSTEM_OPENEULER}"
    elif [ -s "${File_OpenCloudOSRelease}" ]; then
        SYSTEM_FACTIONS="${SYSTEM_OPENCLOUDOS}"
    elif [ -s "${File_AnolisOSRelease}" ]; then
        SYSTEM_FACTIONS="${SYSTEM_ANOLISOS}"
    elif [ -s "${File_openKylinVersion}" ]; then
        SYSTEM_FACTIONS="${SYSTEM_OPENKYLIN}"
    elif [ -f "${File_ArchLinuxRelease}" ]; then
        SYSTEM_FACTIONS="${SYSTEM_ARCH}"
    elif [ -f "${File_AlpineRelease}" ]; then
        SYSTEM_FACTIONS="${SYSTEM_ALPINE}"
    elif [ -f "${File_GentooRelease}" ]; then
        SYSTEM_FACTIONS="${SYSTEM_GENTOO}"
    elif [[ "$(cat $File_LinuxRelease | grep -E "^NAME=" | awk -F '=' '{print$2}' | sed "s/[\'\"]//g")" == *"openSUSE"* ]]; then
        SYSTEM_FACTIONS="${SYSTEM_OPENSUSE}"
    elif [[ "$(cat $File_LinuxRelease | grep -E "^NAME=" | awk -F '=' '{print$2}' | sed "s/[\'\"]//g")" == *"NixOS"* ]]; then
        SYSTEM_FACTIONS="${SYSTEM_NIXOS}"
    else
        output_error "无法识别操作系统派系"
    fi

    ## 判定系统类型、版本等
    case "${SYSTEM_FACTIONS}" in
    "${SYSTEM_DEBIAN}" | "${SYSTEM_OPENKYLIN}")
        if ! command -v lsb_release &>/dev/null; then
             # 在root下可以尝试安装，非root则提示
            if [ $UID -eq 0 ]; then
                apt-get update >/dev/null 2>&1 && apt-get install -y lsb-release >/dev/null 2>&1
                if [ $? -ne 0 ]; then
                    output_error "lsb-release 命令不存在且自动安装失败，请手动安装"
                fi
            else
                output_error "需要 lsb-release 命令来识别系统，请先安装它 (例如: sudo apt install lsb-release)"
            fi
        fi
        SYSTEM_JUDGMENT="$(lsb_release -is)"
        ## Raspberry Pi OS 判定
        if [[ "${SYSTEM_FACTIONS}" == "${SYSTEM_DEBIAN}" ]] && [ -s "${File_RaspberryPiOSRelease}" ]; then
            SYSTEM_JUDGMENT="${SYSTEM_RASPBERRY_PI_OS}"
        fi
        ;;
    "${SYSTEM_REDHAT}")
        SYSTEM_JUDGMENT="$(awk '{printf $1}' $File_RedHatRelease)"
        grep -q "${SYSTEM_RHEL}" $File_RedHatRelease && SYSTEM_JUDGMENT="${SYSTEM_RHEL}"
        grep -q "${SYSTEM_CENTOS_STREAM}" $File_RedHatRelease && SYSTEM_JUDGMENT="${SYSTEM_CENTOS_STREAM}"
        ;;
    "${SYSTEM_ARCH}")
        if [ -f "${File_ManjaroRelease}" ]; then
            SYSTEM_JUDGMENT="${SYSTEM_MANJARO}"
        else
            SYSTEM_JUDGMENT="${SYSTEM_FACTIONS}"
        fi
        ;;
    *)
        SYSTEM_JUDGMENT="${SYSTEM_FACTIONS}"
        ;;
    esac

    ## 定义系统版本号
    SYSTEM_VERSION_ID="$(cat $File_LinuxRelease | grep -E "^VERSION_ID=" | awk -F '=' '{print$2}' | sed "s/[\'\"]//g")"
    SYSTEM_VERSION_ID_MAJOR="${SYSTEM_VERSION_ID%.*}"
    
    ## 判定系统处理器架构
    DEVICE_ARCH_RAW="$(uname -m)"
    case "${DEVICE_ARCH_RAW}" in
    x86_64)
        DEVICE_ARCH="x86_64"
        ;;
    aarch64)
        DEVICE_ARCH="ARM64"
        ;;
    arm64)
        DEVICE_ARCH="ARM64"
        ;;
    *)
        DEVICE_ARCH="${DEVICE_ARCH_RAW}"
        output_error "不支持的处理器架构 ${DEVICE_ARCH_RAW}"
        ;;
    esac
}

## 根据检测到的系统信息，确定包管理器
function determine_package_manager() {
    local pm_command=""
    case "${SYSTEM_FACTIONS}" in
        "${SYSTEM_DEBIAN}" | "${SYSTEM_OPENKYLIN}")
            pm_command="apt"
            ;;
        "${SYSTEM_REDHAT}" | "${SYSTEM_OPENEULER}" | "${SYSTEM_OPENCLOUDOS}" | "${SYSTEM_ANOLISOS}")
            # RHEL及其衍生版8.0及以上版本默认使用dnf
            if [[ "${SYSTEM_JUDGMENT}" == "${SYSTEM_CENTOS}" && "${SYSTEM_VERSION_ID_MAJOR}" -lt 8 ]] || \
               [[ "${SYSTEM_JUDGMENT}" == "${SYSTEM_RHEL}" && "${SYSTEM_VERSION_ID_MAJOR}" -lt 8 ]]; then
                pm_command="yum"
            else
                pm_command="dnf"
            fi
            ;;
        "${SYSTEM_ARCH}")
            pm_command="pacman"
            ;;
        "${SYSTEM_OPENSUSE}")
            pm_command="zypper"
            ;;
        "${SYSTEM_ALPINE}")
            pm_command="apk"
            ;;
        "${SYSTEM_GENTOO}")
            pm_command="emerge"
            ;;
        "${SYSTEM_NIXOS}")
            pm_command="nix-env"
            ;;
        *)
            output_error "无法为系统派系 ${SYSTEM_FACTIONS} 确定包管理器"
            ;;
    esac
    echo "${pm_command}"
}

detect_system_info
PACKAGE_MANAGER=$(determine_package_manager)

echo "{\
\"distroName\":\"${SYSTEM_JUDGMENT}\",\
\"version\":\"${SYSTEM_VERSION_ID}\",\
\"arch\":\"${DEVICE_ARCH}\",\
\"pm\":\"${PACKAGE_MANAGER}\"\
}"
