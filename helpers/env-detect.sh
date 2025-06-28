#!/bin/sh
set -e

distro_pretty_name="unknown"
distro_id="unknown"
version_id="unknown"
arch="unknown"
kernel_version="unknown"
headers_package_info="not found" # Final output value
glibc_output_version="unknown"   # Final output value
dkms_output_version="not found"  # Final output value

docker_found="false"
is_root="false"
npu_present="false"      # NPU Detected via lspci (Huawei Ascend)
npu_smi_found="false"    # npu-smi command found
gpu_present="false"      # GPU Detected via lspci (NVIDIA)
gpu_smi_found="false"    # nvidia-smi command found

zstd_version="not found"
aria2_version="not found"
jq_version="not found"

distro_source_method="unknown"
headers_status="not found"
glibc_version_raw="unknown"
glibc_detection_method="unknown"
dkms_version_raw="unknown"å
dkms_detection_method="not found"

if [ -f /etc/os-release ]; then
    . /etc/os-release
    distro_pretty_name="${PRETTY_NAME:-unknown}"
    distro_id="${ID:-unknown}"
    version_id="${VERSION_ID:-unknown}"
    distro_source_method="/etc/os-release"
elif command -v lsb_release >/dev/null 2>&1; then
    distro_pretty_name=$(lsb_release -ds 2>/dev/null || echo "unknown")
    distro_id=$(lsb_release -is 2>/dev/null | tr '[:upper:]' '[:lower:]' || echo "unknown")
    version_id=$(lsb_release -rs 2>/dev/null || echo "unknown")
    distro_source_method="lsb_release"
elif [ -f /etc/redhat-release ]; then
    distro_pretty_name=$(cat /etc/redhat-release 2>/dev/null || echo "unknown")
    distro_id="rhel"
    version_id=$(cat /etc/redhat-release 2>/dev/null | grep -oE '[0-9]+\.[0-9]+' || echo "unknown")
    distro_source_method="/etc/redhat-release"
elif [ -f /etc/debian_version ]; then
    distro_pretty_name="Debian/Ubuntu variant - Version: $(cat /etc/debian_version 2>/dev/null || echo "unknown")"
    distro_id="debian"
    version_id=$(cat /etc/debian_version 2>/dev/null || echo "unknown")
    distro_source_method="/etc/debian_version"
fi

arch=$(uname -m 2>/dev/null || echo "unknown")

kernel_version=$(uname -r 2>/dev/null || echo "unknown")

if [ "$kernel_version" != "unknown" ]; then
    if command -v dpkg >/dev/null 2>&1; then
        header_pkg_name="linux-headers-${kernel_version}"
        header_info_raw=$(dpkg-query -W -f='${Package} ${Version}' "$header_pkg_name" 2>/dev/null)
        if [ $? -eq 0 ] && [ -n "$header_info_raw" ]; then
            headers_status="found (dpkg)"
        fi
    elif command -v rpm >/dev/null 2>&1; then
        header_pkg_name="kernel-devel-${kernel_version}"
        header_info_raw=$(rpm -q --qf '%{NAME}-%{VERSION}-%{RELEASE}' "$header_pkg_name" 2>/dev/null)
        if [ $? -eq 0 ] && [ -n "$header_info_raw" ]; then
            headers_status="found (rpm: kernel-devel)"
        else
            header_pkg_name_alt="kernel-headers-${kernel_version}"
            header_info_alt=$(rpm -q --qf '%{NAME}-%{VERSION}-%{RELEASE}' "$header_pkg_name_alt" 2>/dev/null)
            if [ $? -eq 0 ] && [ -n "$header_info_alt" ]; then
                header_info_raw="$header_info_alt"
                headers_status="found (rpm: kernel-headers)"
            fi
        fi
    fi

    if [ "$headers_status" = "not found" ]; then
         if [ -d "/usr/src/linux-headers-${kernel_version}" ]; then
              header_info_raw="/usr/src/linux-headers-${kernel_version}"
              headers_status="found (directory exists)"
         elif [ -d "/usr/src/kernels/${kernel_version}" ]; then
              header_info_raw="/usr/src/kernels/${kernel_version}"
              headers_status="found (directory exists)"
         fi
    fi

    if [ "$headers_status" != "not found" ]; then
        headers_package_info="$header_info_raw"
    fi
else
    headers_package_info="kernel version unknown"
fi

if command -v getconf >/dev/null 2>&1; then
    gnu_libc_version=$(getconf GNU_LIBC_VERSION 2>/dev/null)
    if [ -n "$gnu_libc_version" ]; then
        glibc_version_raw=$(echo "$gnu_libc_version" | awk '{print $NF}')
        glibc_detection_method="getconf"
    fi
fi
if [ "$glibc_detection_method" = "unknown" ]; then
    for libc_path in /lib64/libc.so.6 /lib/libc.so.6 /lib/x86_64-linux-gnu/libc.so.6 /lib/i386-linux-gnu/libc.so.6; do
        if [ -x "$libc_path" ]; then
             libc_output=$("$libc_path" 2>/dev/null | head -n 1)
             case "$libc_output" in
                 *"GNU C Library"*)
                     version_part=$(echo "$libc_output" | awk '{print $NF}')
                     case "$version_part" in
                         [0-9]*.[0-9]*)
                            glibc_version_raw="$version_part"
                            glibc_detection_method="libc execution"
                            break
                            ;;
                     esac
                     ;;
             esac
        fi
    done
fi
if [ "$glibc_detection_method" = "unknown" ] && command -v ldd >/dev/null 2>&1; then
    ldd_output=$(ldd --version 2>/dev/null | head -n 1)
     if [ -n "$ldd_output" ]; then
         case "$ldd_output" in
             *"libc"*)
                 version_part=$(echo "$ldd_output" | awk '{print $NF}')
                 case "$version_part" in
                     [0-9]*.[0-9]*)
                         glibc_version_raw="$version_part"
                         glibc_detection_method="ldd"
                         ;;
                 esac
                 ;;
         esac
     fi
fi
if [ "$glibc_version_raw" != "unknown" ]; then
    glibc_output_version="$glibc_version_raw"
else
    glibc_output_version="unknown"
fi


if command -v dpkg >/dev/null 2>&1; then
    dkms_info=$(dpkg-query -W -f='${Version}' dkms 2>/dev/null)
    if [ $? -eq 0 ] && [ -n "$dkms_info" ]; then
        dkms_version_raw="$dkms_info"
        dkms_detection_method="dpkg"
    fi
elif command -v rpm >/dev/null 2>&1; then
    dkms_info=$(rpm -q --qf '%{VERSION}-%{RELEASE}' dkms 2>/dev/null)
     if [ $? -eq 0 ] && [ -n "$dkms_info" ]; then
        dkms_version_raw="$dkms_info"
        dkms_detection_method="rpm"
     fi
fi
# (command)
if [ "$dkms_detection_method" = "not found" ] && command -v dkms >/dev/null 2>&1; then
     dkms_version_cmd=$(dkms --version 2>/dev/null)
     if [ -n "$dkms_version_cmd" ]; then
          dkms_version_raw=$(echo "$dkms_version_cmd" | awk '{print $NF}')
          dkms_detection_method="dkms command"
     else
          dkms_detection_method="dkms command found, version query failed"
     fi
fi
if [ "$dkms_detection_method" != "not found" ]; then
    dkms_output_version="$dkms_version_raw"
else
    dkms_output_version="not found" # Keep as "not found" if detection method remains "not found"
fi


if command -v docker >/dev/null 2>&1; then
    docker_found="true"
fi

if command -v lspci >/dev/null 2>&1; then
    lspci_output=$(lspci)
    if echo "$lspci_output" | grep -q "Processing accelerators: Huawei Technologies"; then
        npu_present="true"
        if command -v npu-smi >/dev/null 2>&1; then
            npu_smi_found="true"
        fi
    fi

    if echo "$lspci_output" | grep -iqE 'VGA compatible controller.*NVIDIA|3D controller.*NVIDIA'; then
        gpu_present="true"
        if command -v nvidia-smi >/dev/null 2>&1; then
            gpu_smi_found="true"
        fi
    fi
else
    : # Variables remain false
fi

if [ "$(id -u)" -eq 0 ]; then
   is_root="true"
fi

if command -v zstd >/dev/null 2>&1; then
    zstd_ver_line=$(zstd --version 2>/dev/null)
    case "$zstd_ver_line" in
        *"v"*)
            zstd_version=$(echo "$zstd_ver_line" | sed -n 's/.* v\([0-9.]*\).*/\1/p')
            ;;
    esac
    if [ -z "$zstd_version" ] || [ "$zstd_version" = "not found" ]; then
         zstd_version="installed (version parse failed)"
    fi
fi

if command -v aria2c >/dev/null 2>&1; then
    aria2_ver_line=$(aria2c --version 2>/dev/null | head -n 1)
    case "$aria2_ver_line" in
        *"version"*)
            aria2_version=$(echo "$aria2_ver_line" | awk '{print $3}')
            ;;
    esac
    if [ -z "$aria2_version" ] || [ "$aria2_version" = "not found" ]; then
         aria2_version="installed (version parse failed)"
    fi
fi

jq_ver_line=$(jq --version 2>/dev/null)
case "$jq_ver_line" in
    *"jq-"*)
        jq_version=$(echo "$jq_ver_line" | sed 's/jq-//')
        ;;
esac
if [ -z "$jq_version" ] || [ "$jq_version" = "not found" ]; then
    jq_version="installed (version parse failed)"
fi


# Prepare boolean JSON literals (true/false, lowercase)
docker_json=$([ "$docker_found" = "true" ] && echo "true" || echo "false")
is_root_json=$([ "$is_root" = "true" ] && echo "true" || echo "false")
npu_present_json=$([ "$npu_present" = "true" ] && echo "true" || echo "false")
npu_smi_found_json=$([ "$npu_smi_found" = "true" ] && echo "true" || echo "false")
gpu_present_json=$([ "$gpu_present" = "true" ] && echo "true" || echo "false")
gpu_smi_found_json=$([ "$gpu_smi_found" = "true" ] && echo "true" || echo "false")

echo "{\
\"distroName\":\"$distro_pretty_name\",\
\"distro\":\"$distro_id\",\
\"version\":\"$version_id\",\
\"architecture\":\"$arch\",\
\"kernel\":\"$kernel_version\",\
\"headersPackageInfo\":\"$headers_package_info\",\
\"glibc\":\"$glibc_output_version\",\
\"glibcDetectionMethod\":\"$glibc_detection_method\",\
\"dkms\":\"$dkms_output_version\",\
\"dkmsDetectionMethod\":\"$dkms_detection_method\",\
\"docker\":$docker_json,\
\"npuPresent\":$npu_present_json,\
\"npuSmiFound\":$npu_smi_found_json,\
\"gpuPresent\":$gpu_present_json,\
\"gpuSmiFound\":$gpu_smi_found_json,\
\"root\":$is_root_json,\
\"zstd\":\"$zstd_version\",\
\"aria2\":\"$aria2_version\",\
\"jq\":\"$jq_version\"\
}"
exit 0
