# 阿里云服务器 Docker 部署 MySQL 服务

## 一、拉取镜像

```bash
docker pull mysql:8.0
```

## 二、创建数据持久化目录

```bash
sudo mkdir -p /data/mysql/{data,conf,logs}
```

## 三、自定义 MySQL 配置（可选）

```bash
sudo tee /data/mysql/conf/my.cnf <<-'EOF'
[mysqld]
port = 3306
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
max_connections = 500

# 允许所有 IP 连接（外网访问需要）
bind-address = 0.0.0.0

# 时区
default-time-zone = '+08:00'

[client]
default-character-set = utf8mb4
EOF
```

## 四、启动容器

```bash
docker run -d \
  --name mysql8 \
  --restart=always \
  -p 3306:3306 \
  -v /data/mysql/data:/var/lib/mysql \
  -v /data/mysql/conf/my.cnf:/etc/mysql/my.cnf \
  -v /data/mysql/logs:/var/log/mysql \
  -e MYSQL_ROOT_PASSWORD=your_root_password \
  -e TZ=Asia/Shanghai \
  mysql:8.0
```

| 参数 | 说明 |
|------|------|
| `-d` | 后台运行 |
| `--restart=always` | 容器退出/Docker 重启后自动拉起 |
| `-p 3306:3306` | 宿主机 3306 → 容器 3306（外网通过该端口访问） |
| `-v /data/mysql/data` | 数据持久化，容器删除数据不丢 |
| `-v /data/mysql/conf/my.cnf` | 挂载自定义配置 |
| `-e MYSQL_ROOT_PASSWORD` | 设置 root 密码（**务必修改**） |

## 五、验证容器状态

```bash
docker ps -a --filter name=mysql8
docker logs mysql8 --tail 20
```

## 六、配置外网访问

### 6.1 容器内授权远程登录

```bash
docker exec -it mysql8 mysql -uroot -p

# 在 MySQL 中执行（将 your_password 替换为实际密码）
CREATE USER 'root'@'%' IDENTIFIED BY 'your_root_password';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

### 6.2 阿里云安全组放行

在 **阿里云控制台 → 云服务器 ECS → 安全组 → 配置规则** 添加入方向规则：

| 规则方向 | 协议 | 端口 | 授权对象 | 备注 |
|---------|------|------|---------|------|
| 入方向 | TCP | 3306 | `0.0.0.0/0` | MySQL 访问（按需缩小范围） |

> ⚠️ `0.0.0.0/0` 表示允许所有 IP 访问。**生产环境请限制为具体客户端 IP**，例如 `114.114.114.114/32`。

### 6.3 服务器内部防火墙放行

```bash
# firewalld
sudo firewall-cmd --add-port=3306/tcp --permanent
sudo firewall-cmd --reload

# iptables
sudo iptables -A INPUT -p tcp --dport 3306 -j ACCEPT
```

## 七、测试连接

### 本地测试

```bash
docker exec -it mysql8 mysql -uroot -p -e "SELECT VERSION();"
```

### 外网测试

```bash
mysql -h <服务器公网IP> -P 3306 -u root -p
```

端口连通性快速验证：

```bash
telnet <服务器公网IP> 3306
```

## 八、常用运维命令

```bash
# 启动/停止/重启
docker start mysql8
docker stop mysql8
docker restart mysql8

# 查看实时日志
docker logs -f mysql8

# 进入容器
docker exec -it mysql8 bash

# 备份数据库
docker exec mysql8 mysqldump -uroot -p --all-databases > /data/mysql/backup.sql

# 恢复数据库
docker exec -i mysql8 mysql -uroot -p < /data/mysql/backup.sql

# 查看资源占用
docker stats mysql8

# 查看容器详细信息（含 IP、挂载卷等）
docker inspect mysql8
```

## 九、一键部署脚本

```bash
#!/bin/bash
# deploy_mysql_on_aliyun.sh
# 在阿里云服务器上一键部署 MySQL 8.0（需先安装 Docker）
set -euo pipefail

MYSQL_ROOT_PASS="${1:-MyRootPass123!}"
MYSQL_PORT="${2:-3306}"
DATA_DIR="/data/mysql"

echo "=== 1. 创建数据目录 ==="
sudo mkdir -p "$DATA_DIR"/{data,conf,logs}

echo "=== 2. 写入 my.cnf ==="
sudo tee "$DATA_DIR/conf/my.cnf" > /dev/null <<-'EOF'
[mysqld]
port = 3306
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
max_connections = 500
bind-address = 0.0.0.0
default-time-zone = '+08:00'
[client]
default-character-set = utf8mb4
EOF

echo "=== 3. 拉取并启动 MySQL ==="
docker pull mysql:8.0

docker rm -f mysql8 2>/dev/null || true
docker run -d \
  --name mysql8 \
  --restart=always \
  -p "$MYSQL_PORT":3306 \
  -v "$DATA_DIR/data":/var/lib/mysql \
  -v "$DATA_DIR/conf/my.cnf":/etc/mysql/my.cnf \
  -v "$DATA_DIR/logs":/var/log/mysql \
  -e MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASS" \
  -e TZ=Asia/Shanghai \
  mysql:8.0

echo "=== 4. 等待启动 ==="
sleep 10

echo "=== 5. 授权远程访问 ==="
docker exec mysql8 mysql -uroot -p"$MYSQL_ROOT_PASS" \
  -e "CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '$MYSQL_ROOT_PASS';" \
  -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;" \
  -e "FLUSH PRIVILEGES;"

echo "=== 部署完成 ==="
echo "公网连接: mysql -h <服务器公网IP> -P $MYSQL_PORT -u root -p"
echo "务必在阿里云安全组放行端口 $MYSQL_PORT"
```

使用方式：

```bash
# 默认密码 MyRootPass123!，默认端口 3306
bash deploy_mysql_on_aliyun.sh

# 自定义密码和端口
bash deploy_mysql_on_aliyun.sh MySecurePass123! 3307
```
