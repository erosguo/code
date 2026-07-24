#!/bin/bash
# 将阿里云服务器改造为云模型服务器

uname -a

# 1. 创建 4GB swap 文件
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 2. 持久化到 /etc/fstab
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 3. 验证
free -h
swapon --show

sudo dnf list zstd
sudo dnf -y install zstd

# 1. 安装Ollama
curl -fsSL https://ollama.com/install.sh | sh

export OLLAMA_MIRROR="https://ghproxy.cn/https://github.com/ollama/ollama/releases/latest/download"
curl -fsSL https://ollama.com/install.sh | sed "s|https://ollama.com/download|$OLLAMA_MIRROR|g" | sh

# 2. 后台启动Ollama服务（通常安装完已自动启动）
ollama serve &

# 3. 拉取并运行Qwen2.5:0.5B模型
# 该命令会自动下载约398MB的量化模型并启动对话[citation:4]
ollama run qwen2.5:0.5b