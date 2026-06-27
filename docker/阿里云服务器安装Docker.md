# 阿里云服务器安装 Docker

## 一、安装 Docker

### 方案 A：Alibaba Cloud Linux / CentOS（推荐）

```bash
#!/bin/bash
set -euo pipefail

# 1. 卸载旧版本
sudo dnf remove -y docker docker-engine docker.io containerd runc || true

# 2. 安装依赖
sudo dnf install -y yum-utils device-mapper-persistent-data lvm2

# 3. 添加 Docker 官方仓库（阿里云镜像）
sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 4. 安装 Docker
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 5. 启动并设置开机自启
sudo systemctl enable docker --now

# 6. 验证
sudo docker version
sudo docker run hello-world

# 7. 将当前用户加入 docker 组（免 sudo）
sudo usermod -aG docker $USER
newgrp docker
```

### 方案 B：Ubuntu / Debian

```bash
#!/bin/bash
set -euo pipefail

# 1. 卸载旧版本
sudo apt-get remove -y docker docker-engine docker.io containerd runc || true

# 2. 安装依赖
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# 3. 添加 Docker 官方 GPG 密钥和仓库（阿里云镜像）
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. 安装 Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 5. 启动并设置开机自启
sudo systemctl enable docker --now

# 6. 验证
sudo docker version

# 7. 将当前用户加入 docker 组（免 sudo）
sudo usermod -aG docker $USER
```

### 方案 C：get.docker.com 官方脚本（通用）

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable docker --now
sudo usermod -aG docker $USER
```

---

## 二、配置镜像加速（国内服务器必配）

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://dockerproxy.com",
    "https://hub-mirror.c.163.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

验证镜像加速生效：

```bash
docker info | grep -A 5 "Registry Mirrors"
```

---

## 三、验证安装

```bash
# 查看 Docker 版本
docker version

# 查看系统信息
docker info

# 运行测试容器
docker run --rm hello-world

# 查看运行状态
sudo systemctl status docker
```
