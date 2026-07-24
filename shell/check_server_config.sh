#!/bin/bash
#
# Linux 服务器配置查看脚本
# 用法: ./check_server_config.sh [section]
#   不传参数时输出全部信息；可指定 section 只查看某一项，例如: ./check_server_config.sh cpu
#

set -euo pipefail

SECTION="${1:-all}"

print_header() {
    echo ""
    echo "=========================================="
    echo " $1"
    echo "=========================================="
}

check_os() {
    print_header "操作系统信息"
    if [ -f /etc/os-release ]; then
        cat /etc/os-release
    else
        uname -a
    fi
    echo ""
    echo "主机名: $(hostname)"
    echo "内核版本: $(uname -r)"
    echo "系统架构: $(uname -m)"
    echo "运行时间: $(uptime -p 2>/dev/null || uptime)"
}

check_cpu() {
    print_header "CPU 信息"
    if [ -f /proc/cpuinfo ]; then
        echo "CPU 型号: $(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2 | xargs)"
        echo "物理 CPU 数: $(grep -c '^physical id' /proc/cpuinfo | sort -u | wc -l)"
        echo "逻辑核心数: $(nproc 2>/dev/null || grep -c '^processor' /proc/cpuinfo)"
        echo ""
        lscpu 2>/dev/null || grep -E '^(processor|model name|cpu MHz|cache size)' /proc/cpuinfo
    else
        echo "无法读取 /proc/cpuinfo"
    fi
}

check_memory() {
    print_header "内存信息"
    free -h
    echo ""
    if [ -f /proc/meminfo ]; then
        echo "详细内存:"
        grep -E '^(MemTotal|MemFree|MemAvailable|Buffers|Cached|SwapTotal|SwapFree):' /proc/meminfo
    fi
}

check_disk() {
    print_header "磁盘使用情况"
    df -hT
    echo ""
    print_header "磁盘分区与挂载"
    lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT 2>/dev/null || lsblk
    echo ""
    if command -v fdisk >/dev/null 2>&1; then
        print_header "块设备概览"
        fdisk -l 2>/dev/null | head -30 || true
    fi
}

check_network() {
    print_header "网络接口"
    ip -br addr 2>/dev/null || ifconfig -a 2>/dev/null || ip addr
    echo ""
    print_header "路由表"
    ip route 2>/dev/null || route -n
    echo ""
    print_header "监听端口"
    ss -tuln 2>/dev/null || netstat -tuln 2>/dev/null || echo "ss/netstat 不可用"
    echo ""
    print_header "DNS 配置"
    cat /etc/resolv.conf 2>/dev/null || echo "无 DNS 配置"
}

check_load() {
    print_header "系统负载"
    uptime
    echo ""
    if [ -f /proc/loadavg ]; then
        echo "负载详情: $(cat /proc/loadavg)"
    fi
    echo ""
    print_header "CPU 使用率 (top 快照)"
    top -bn1 2>/dev/null | head -5 || echo "top 不可用"
}

check_process() {
    print_header "进程数量"
    echo "总进程数: $(ps -e --no-headers 2>/dev/null | wc -l)"
    echo ""
    print_header "内存占用 Top 10 进程"
    ps aux --sort=-%mem 2>/dev/null | head -11 || ps -eo pid,user,%mem,%cpu,comm --sort=-%mem | head -11
}

check_user() {
    print_header "当前登录用户"
    who
    echo ""
    print_header "最近登录记录"
    last -n 10 2>/dev/null || echo "last 命令不可用"
    echo ""
    print_header "系统用户数量"
    echo "用户数: $(cut -d: -f1 /etc/passwd | wc -l)"
}

check_service() {
    print_header "系统服务状态"
    if command -v systemctl >/dev/null 2>&1; then
        systemctl list-units --type=service --state=running --no-pager 2>/dev/null | head -20
        echo ""
        echo "失败的服务:"
        systemctl list-units --type=service --state=failed --no-pager 2>/dev/null || echo "无"
    else
        echo "systemctl 不可用 (可能非 systemd 系统)"
        ps aux | head -15
    fi
}

check_env() {
    print_header "环境变量 (部分)"
    echo "PATH=$PATH"
    echo "SHELL=${SHELL:-未设置}"
    echo "USER=${USER:-未设置}"
    echo "HOME=${HOME:-未设置}"
    echo "LANG=${LANG:-未设置}"
}

check_hardware() {
    print_header "硬件概览"
    if command -v dmidecode >/dev/null 2>&1; then
        echo "制造商: $(dmidecode -s system-manufacturer 2>/dev/null || echo '需 root 权限')"
        echo "型号:   $(dmidecode -s system-product-name 2>/dev/null || echo '需 root 权限')"
    fi
    if command -v lspci >/dev/null 2>&1; then
        echo ""
        echo "PCI 设备 (前 10 条):"
        lspci 2>/dev/null | head -10
    fi
}

run_section() {
    case "$1" in
        os)        check_os ;;
        cpu)       check_cpu ;;
        memory|mem) check_memory ;;
        disk)      check_disk ;;
        network|net) check_network ;;
        load)      check_load ;;
        process|ps) check_process ;;
        user)      check_user ;;
        service)   check_service ;;
        env)       check_env ;;
        hardware|hw) check_hardware ;;
        all)
            check_os
            check_cpu
            check_memory
            check_disk
            check_network
            check_load
            check_process
            check_user
            check_service
            check_env
            check_hardware
            ;;
        help|-h|--help)
            echo "用法: $0 [section]"
            echo ""
            echo "可用 section:"
            echo "  os        - 操作系统信息"
            echo "  cpu       - CPU 信息"
            echo "  memory    - 内存信息"
            echo "  disk      - 磁盘信息"
            echo "  network   - 网络信息"
            echo "  load      - 系统负载"
            echo "  process   - 进程信息"
            echo "  user      - 用户与登录"
            echo "  service   - 系统服务"
            echo "  env       - 环境变量"
            echo "  hardware  - 硬件概览"
            echo "  all       - 全部 (默认)"
            ;;
        *)
            echo "未知 section: $1"
            echo "运行 $0 help 查看可用选项"
            exit 1
            ;;
    esac
}

run_section "$SECTION"
