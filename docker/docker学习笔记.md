# Docker 学习笔记

## 核心概念

| 概念 | 说明 |
|------|------|
| **镜像 (Image)** | 只读模板，含运行环境与代码，由多层组成 |
| **容器 (Container)** | 镜像的运行实例，可读写层，相互隔离 |
| **仓库 (Registry)** | 存储分发镜像的地方（Docker Hub、私有仓库等） |
| **Dockerfile** | 描述如何构建镜像的脚本 |
| **数据卷 (Volume)** | 持久化数据的机制，独立于容器生命周期 |

### 架构简览

```
┌─────────────────────────────────────────┐
│  Client (docker CLI)                     │
│  docker build / pull / run / ...         │
└────────────┬────────────────────────────┘
             │ REST API
┌────────────▼────────────────────────────┐
│  Docker Daemon (dockerd)                 │
│  管理 镜像 / 容器 / 网络 / 卷           │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│  containerd                              │
│  容器生命周期管理 (runC)                │
└─────────────────────────────────────────┘
```

---

## 安装与配置

### Windows / macOS
下载 [Docker Desktop](https://www.docker.com/products/docker-desktop) 安装即可。

### Linux
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # 免 sudo 运行 docker
```

### 镜像加速器配置（国内推荐）

创建或修改 `C:\Users\<用户>\.docker\daemon.json`（Windows）或 `/etc/docker/daemon.json`（Linux）：

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://dockerproxy.com"
  ]
}
```

重启 Docker 生效。

---

## 镜像分层与构建优化

### 分层原理

Docker 镜像由多个只读层叠加，每一层对应 Dockerfile 的一条指令。层可被多个镜像共享，节省磁盘空间。

```
┌──────────────┐  ← 容器可写层（容器删除后丢失）
├──────────────┤
│  RUN npm i   │  ← 镜像层
├──────────────┤
│  COPY . .    │  ← 镜像层
├──────────────┤
│  WORKDIR     │  ← 镜像层
├──────────────┤
│  FROM node   │  ← 基础镜像层
└──────────────┘
```

### 构建优化技巧

1. **调整指令顺序**——不变的放前面，变化的放后面，充分利用层缓存
2. **合并 RUN 指令**——减少层数
3. **使用 .dockerignore**——排除无用文件

```dockerfile
# ❌ 不推荐：每次代码变更都会导致 npm install 重跑
COPY . .
RUN npm install

# ✅ 推荐：先复制 package.json，缓存 npm install 层
COPY package*.json .
RUN npm install
COPY . .
```

### .dockerignore

```dockerignore
node_modules
.git
*.md
Dockerfile
.dockerignore
.gitignore
dist/*.map
```

---

## 多阶段构建（Multi-stage Build）

用多个 FROM 阶段，只将最终产物复制到最后一个阶段，显著减小镜像体积。

```dockerfile
# 阶段 1：编译
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN go build -o server .

# 阶段 2：运行（仅含二进制，体积缩小 10x+）
FROM alpine:3.19
RUN apk --no-cache add ca-certificates
COPY --from=builder /app/server /server
CMD ["/server"]
```

```dockerfile
# 前端项目示例
FROM node:20 AS build
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

---

## 常用命令速查（附详细示例）

### 镜像管理

| 命令 | 说明 | 示例 |
|------|------|------|
| `docker images` | 列出本地镜像 | `docker images` |
| `docker pull <image>` | 拉取镜像 | `docker pull nginx:1.25` |
| `docker rmi <image>` | 删除镜像 | `docker rmi nginx:1.25` |
| `docker search <keyword>` | 搜索镜像 | `docker search nginx` |
| `docker build -t <name>:<tag> .` | 从 Dockerfile 构建镜像 | `docker build -t myapp:v1 .` |
| `docker tag <image> <new>:<tag>` | 给镜像打标签 | `docker tag nginx:latest mynginx:v1` |
| `docker save -o <file.tar> <image>` | 导出镜像为 tar | `docker save -o nginx.tar nginx:1.25` |
| `docker load -i <file.tar>` | 从 tar 导入镜像 | `docker load -i nginx.tar` |
| `docker push <image>` | 推送镜像到仓库 | `docker push myrepo/myapp:v1` |
| `docker history <image>` | 查看镜像构建历史 | `docker history nginx:1.25` |
| `docker image prune` | 删除悬空镜像 | `docker image prune` |

### 容器管理

| 命令 | 说明 | 示例 |
|------|------|------|
| `docker ps` | 列出运行中的容器 | `docker ps` |
| `docker ps -a` | 列出所有容器（含已停止） | `docker ps -a` |
| `docker run <image>` | 创建并启动容器 | `docker run nginx` |
| `docker run -d <image>` | 后台运行容器 | `docker run -d nginx` |
| `docker run -it <image> bash` | 交互式进入容器 | `docker run -it ubuntu bash` |
| `docker run -p <host>:<container> <image>` | 端口映射 | `docker run -d -p 8080:80 nginx` |
| `docker run -v <host>:<container> <image>` | 挂载卷 | `docker run -d -v /data:/app/data nginx` |
| `docker run --name <name> <image>` | 指定容器名称 | `docker run -d --name myweb nginx` |
| `docker run --restart=always <image>` | 设置重启策略 | `docker run -d --restart=always nginx` |
| `docker run --rm <image>` | 容器停止后自动删除 | `docker run --rm nginx echo hi` |
| `docker start <container>` | 启动已停止的容器 | `docker start myweb` |
| `docker stop <container>` | 停止容器 | `docker stop myweb` |
| `docker restart <container>` | 重启容器 | `docker restart myweb` |
| `docker rm <container>` | 删除容器 | `docker rm myweb` |
| `docker rm -f <container>` | 强制删除运行中的容器 | `docker rm -f myweb` |
| `docker rm $(docker ps -aq)` | 删除所有容器 | `docker rm $(docker ps -aq)` |
| `docker logs <container>` | 查看容器日志 | `docker logs myweb` |
| `docker logs -f <container>` | 实时跟踪日志 | `docker logs -f myweb` |
| `docker logs --tail 100 <container>` | 查看最后 N 行日志 | `docker logs --tail 100 myweb` |
| `docker exec -it <container> bash` | 进入运行中的容器 | `docker exec -it myweb bash` |
| `docker exec <container> <cmd>` | 在容器中执行命令 | `docker exec myweb ls -la` |
| `docker cp <src> <container>:<dst>` | 文件复制到容器 | `docker cp index.html myweb:/usr/share/nginx/html/` |
| `docker cp <container>:<src> <dst>` | 从容器复制文件 | `docker cp myweb:/var/log/nginx/access.log ./` |
| `docker inspect <container>` | 查看容器详细信息 | `docker inspect myweb` |
| `docker inspect -f '{{.NetworkSettings.IPAddress}}' <container>` | 查看容器 IP | `docker inspect -f '{{.NetworkSettings.IPAddress}}' myweb` |
| `docker container prune` | 删除所有已停止的容器 | `docker container prune` |

### 网络管理

| 命令 | 说明 | 示例 |
|------|------|------|
| `docker network ls` | 列出网络 | `docker network ls` |
| `docker network create <name>` | 创建网络 | `docker network create mynet` |
| `docker network create -d bridge <name>` | 创建指定驱动网络 | `docker network create -d bridge mynet` |
| `docker network connect <net> <container>` | 容器接入网络 | `docker network connect mynet myweb` |
| `docker network disconnect <net> <container>` | 容器断开网络 | `docker network disconnect mynet myweb` |
| `docker network inspect <name>` | 查看网络详情 | `docker network inspect mynet` |
| `docker network rm <name>` | 删除网络 | `docker network rm mynet` |
| `docker network prune` | 删除未使用的网络 | `docker network prune` |

### 数据卷管理

| 命令 | 说明 | 示例 |
|------|------|------|
| `docker volume ls` | 列出数据卷 | `docker volume ls` |
| `docker volume create <name>` | 创建数据卷 | `docker volume create myvol` |
| `docker volume inspect <name>` | 查看数据卷详情 | `docker volume inspect myvol` |
| `docker volume rm <name>` | 删除数据卷 | `docker volume rm myvol` |
| `docker volume prune` | 删除未使用的数据卷 | `docker volume prune` |

### 其他

| 命令 | 说明 | 示例 |
|------|------|------|
| `docker info` | 查看 Docker 系统信息 | `docker info` |
| `docker version` | 查看版本 | `docker version` |
| `docker system df` | 查看磁盘使用 | `docker system df` |
| `docker system prune` | 清理未使用的资源 | `docker system prune` |
| `docker system prune -a` | 清理所有未使用的资源（含镜像） | `docker system prune -a` |
| `docker stats` | 查看容器资源占用 | `docker stats` |
| `docker top <container>` | 查看容器进程 | `docker top myweb` |
| `docker events` | 实时监听 Docker 事件 | `docker events` |
| `docker login` | 登录 Docker 仓库 | `docker login -u myuser` |

## Docker Compose 常用命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `docker compose up -d` | 后台启动所有服务 | `docker compose up -d` |
| `docker compose down` | 停止并删除所有服务/网络 | `docker compose down` |
| `docker compose down -v` | 停止并删除服务/网络/数据卷 | `docker compose down -v` |
| `docker compose ps` | 查看服务状态 | `docker compose ps` |
| `docker compose logs -f` | 跟踪所有服务日志 | `docker compose logs -f` |
| `docker compose logs -f web` | 跟踪指定服务日志 | `docker compose logs -f web` |
| `docker compose build` | 重新构建所有镜像 | `docker compose build` |
| `docker compose build web` | 重新构建指定服务 | `docker compose build web` |
| `docker compose exec web bash` | 进入运行中的服务容器 | `docker compose exec web bash` |
| `docker compose restart` | 重启所有服务 | `docker compose restart` |
| `docker compose pull` | 拉取所有依赖镜像 | `docker compose pull` |
| `docker compose config` | 校验并查看最终配置 | `docker compose config` |

---

## Dockerfile 常用指令

```dockerfile
FROM node:20-alpine                    # 基础镜像
WORKDIR /app                           # 工作目录
COPY package*.json ./                  # 复制文件到镜像
ADD app.tar.gz /app                    # 复制文件（支持 URL/tar 自动解压）
RUN npm install                        # 构建时执行命令
CMD ["node", "server.js"]              # 容器启动时的默认命令
ENTRYPOINT ["docker-entrypoint.sh"]    # 容器入口点
ENV NODE_ENV=production                # 设置环境变量
EXPOSE 3000                            # 声明端口
VOLUME /data                           # 挂载卷
LABEL version="1.0"                    # 添加元数据
ARG VERSION=latest                     # 构建参数
USER node                              # 指定运行用户
HEALTHCHECK --interval=30s CMD curl -f http://localhost || exit 1  # 健康检查
```

## docker-compose.yml 示例

```yaml
version: '3.8'
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:80"
    volumes:
      - ./app:/app
      - static_data:/var/www/static
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - appnet

  db:
    image: postgres:13
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: secret
    networks:
      - appnet

volumes:
  pgdata:
  static_data:

networks:
  appnet:
    driver: bridge
```

---

## 容器资源限制

```bash
# 限制内存最大 512M，swap 最大 1G，CPU 使用 1.5 核
docker run -d --name myapp \
  --memory="512m" \
  --memory-swap="1g" \
  --cpus="1.5" \
  nginx
```

```yaml
# docker-compose 中配置资源限制
services:
  web:
    image: nginx
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 256M
        reservations:
          cpus: "0.25"
          memory: 128M
```

---

## 日志管理

### 日志驱动

```bash
# 限制单个日志文件最大 10M，最多保留 3 个文件
docker run -d --name myapp \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  nginx
```

```json
// daemon.json 全局配置
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### 常用排错命令

```bash
# 查看容器标准输出日志
docker logs myapp

# 实时跟踪
docker logs -f myapp

# 只查看最近 50 行
docker logs --tail 50 myapp

# 带时间戳查看
docker logs -t myapp

# 将日志导出到文件
docker logs myapp > app.log
```

---

## 安全最佳实践

```dockerfile
# 1. 不要以 root 运行
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# 2. 首选官方精简镜像
FROM node:20-alpine   # 比 node:20 更小更安全

# 3. 不使用 --latest，锁定版本
FROM python:3.12-slim

# 4. 构建时不要泄露密钥 —— 使用构建参数或 secret
ARG BUILD_ENV
RUN echo "$BUILD_ENV"
# ❌ 不要 COPY 包含密钥的文件
```

```bash
# 安全扫描
docker scout quickstart
docker scout cves myapp:v1

# 以只读文件系统运行（容器内无法写入）
docker run --read-only --tmpfs /tmp nginx

# 限制容器能力
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE nginx
```

---

## 多架构构建（buildx）

构建同时支持 amd64 / arm64 的镜像：

```bash
# 创建构建器
docker buildx create --name mybuilder --use
docker buildx inspect --bootstrap

# 构建并推送多架构镜像
docker buildx build --platform linux/amd64,linux/arm64 \
  -t myrepo/myapp:v1 --push .
```

---

## 常见问题排查

| 问题 | 排查方法 |
|------|----------|
| 容器启动后立即退出 | `docker logs <container>` 查看错误日志 |
| 端口冲突 | `netstat -ano \| findstr :8080` 检查端口占用 |
| 磁盘空间不足 | `docker system df` 查看占用，`docker system prune -a` 清理 |
| 容器内无法联网 | 检查 DNS 配置 `/etc/docker/daemon.json` 设置 `"dns": ["8.8.8.8"]` |
| 镜像拉取慢 | 配置镜像加速器（见上文安装与配置章节） |
| 文件权限错误 | 容器内进程以 root 运行，或挂载卷权限不匹配，检查 `USER` 指令 |

```bash
# 完整诊断
docker info
docker version
docker system df
docker inspect <container>

# 查看 daemon 日志
# Linux: journalctl -u docker --no-pager -n 50
# Windows: Docker Desktop → Troubleshoot → logs
```

---

## 组合命令实战

### 启动一个完整的 Nginx 服务

```powershell
# 拉取镜像
docker pull nginx:alpine

# 启动容器（端口映射 + 挂载网页目录 + 命名）
docker run -d --name myweb -p 8080:80 -v D:\sites:/usr/share/nginx/html nginx:alpine

# 查看容器是否运行
docker ps

# 查看日志确认
docker logs myweb

# 进入容器查看配置
docker exec -it myweb sh

# 停止并删除容器
docker stop myweb; docker rm myweb
```

### 使用网络让两个容器通信

```powershell
# 创建自定义网络
docker network create myapp

# 启动数据库容器
docker run -d --name db --network myapp -e MYSQL_ROOT_PASSWORD=root mysql:8

# 启动应用容器（连接同一网络）
docker run -d --name app --network myapp -p 3000:3000 myapp:v1

# 验证：app 容器内可直接 ping db
docker exec app ping db
```
