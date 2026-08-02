# Kubernetes 学习笔记

## 目录

1. [核心概念](#1-核心概念)
2. [环境搭建](#2-环境搭建)
3. [kubectl 快速上手](#3-kubectl-快速上手)
4. [YAML 配置清单](#4-yaml-配置清单)
5. [Pod](#5-pod)
6. [控制器](#6-控制器)
7. [Service 与网络](#7-service-与网络)
8. [配置与密钥](#8-配置与密钥)
9. [存储](#9-存储)
10. [命名空间与资源隔离](#10-命名空间与资源隔离)
11. [Ingress](#11-ingress)
12. [Helm 包管理](#12-helm-包管理)
13. [RBAC 权限控制](#13-rbac-权限控制)
14. [监控与排错](#14-监控与排错)
15. [实战：部署完整应用](#15-实战部署完整应用)

---

## 1. 核心概念

| 概念 | 说明 |
|------|------|
| **Pod** | 最小调度单元，包含一个或多个容器（共享网络/存储） |
| **Deployment** | 声明式管理 Pod 副本、滚动更新、回滚 |
| **Service** | 稳定的网络入口，将流量负载均衡到一组 Pod |
| **ConfigMap / Secret** | 配置注入（明文 / base64 敏感数据） |
| **Volume** | Pod 级别的存储卷（临时或持久） |
| **PersistentVolume / PersistentVolumeClaim** | 持久化存储的供给与消费 |
| **Namespace** | 逻辑隔离分区（多环境/多团队） |
| **Ingress** | 七层 HTTP 路由，将外部流量映射到 Service |
| **RBAC** | 基于角色的访问控制 |
| **Node** | 集群中的工作节点（物理机或 VM） |
| **Cluster** | 一组 Node 组成的控制面 + 数据面 |

### 架构简览

```
┌──────────────────────────────────────────────────────┐
│  Control Plane (Master)                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  API     │  │ Scheduler│  │Controller│           │
│  │  Server  │  │          │  │ Manager  │           │
│  └────┬─────┘  └──────────┘  └──────────┘           │
│       │ etcd (分布式键值存储，集群状态)              │
└───────┼──────────────────────────────────────────────┘
        │
┌───────▼──────────────────────────────────────────────┐
│  Worker Node                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ Kubelet  │  │ Kube-Proxy│  │ Container Runtime  │ │
│  │          │  │ (网络规则) │  │ (containerd/docker)│ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
│  ┌──────┐ ┌──────┐ ┌──────┐                         │
│  │ Pod  │ │ Pod  │ │ Pod  │                         │
│  └──────┘ └──────┘ └──────┘                         │
└──────────────────────────────────────────────────────┘
```

---

## 2. 环境搭建

### 2.1 Docker Desktop (Windows/macOS)

Docker Desktop 内置单节点 Kubernetes，适合本地学习：

```bash
# 设置 - Docker Desktop → Settings → Kubernetes → Enable Kubernetes
# 切换上下文
kubectl config use-context docker-desktop
```

### 2.2 Minikube（本地单节点集群）

```bash
# 安装
winget install minikube  # Windows
brew install minikube    # macOS

# 启动
minikube start --driver=docker
minikube start --cpus=4 --memory=8g  # 指定资源

# 常用命令
minikube status
minikube dashboard        # 打开 Web UI
minikube stop
minikube delete           # 删除整个集群
minikube ip               # 查看集群 IP
minikube tunnel           # 暴露 LoadBalancer 服务
minikube addons enable ingress  # 启用 Ingress 控制器
```

### 2.3 kind (Kubernetes in Docker)

```bash
# 安装
winget install kind  # Windows

# 创建集群
kind create cluster
kind create cluster --config kind-config.yaml  # 自定义配置

# 多节点集群示例
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker
EOF

# 删除集群
kind delete cluster
```

### 2.4 k3s（轻量级，适合树莓派/边缘）

```bash
curl -sfL https://get.k3s.io | sh -
sudo k3s kubectl get nodes
```

---

## 3. kubectl 快速上手

### 基础命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `kubectl get all` | 查看默认命名空间所有资源 | `kubectl get all` |
| `kubectl get nodes` | 查看节点 | `kubectl get nodes -o wide` |
| `kubectl get pod` | 查看 Pod | `kubectl get pod -n kube-system` |
| `kubectl get deployment` | 查看 Deployment | `kubectl get deploy` |
| `kubectl get svc` | 查看 Service | `kubectl get svc` |
| `kubectl describe <type>/<name>` | 查看资源详细信息 | `kubectl describe pod nginx-pod` |
| `kubectl logs <pod>` | 查看 Pod 日志 | `kubectl logs -f web-xxx` |
| `kubectl logs <pod> -c <container>` | 多容器 Pod 指定容器日志 | `kubectl logs web-xxx -c nginx` |
| `kubectl exec -it <pod> -- sh` | 进入 Pod 交互式终端 | `kubectl exec -it web-xxx -- sh` |
| `kubectl delete <type>/<name>` | 删除资源 | `kubectl delete pod nginx-pod` |
| `kubectl apply -f <file>` | 声明式创建/更新资源 | `kubectl apply -f deploy.yaml` |
| `kubectl delete -f <file>` | 按配置文件删除 | `kubectl delete -f deploy.yaml` |
| `kubectl port-forward <pod> <local>:<remote>` | 本地端口转发到 Pod | `kubectl port-forward pod/nginx 8080:80` |

### 常用选项

```bash
# 宽输出（显示更多列）
kubectl get pod -o wide

# YAML 格式输出
kubectl get pod nginx -o yaml

# JSON 格式输出
kubectl get pod nginx -o json

# 持续监听变化
kubectl get pod -w

# 指定命名空间
kubectl get pod -n my-namespace
kubectl get pod --all-namespaces

# 标签筛选
kubectl get pod -l app=nginx,version=v1

# 简写别名
kubectl get deploy  # deployment
kubectl get svc     # service
kubectl get cm      # configmap
kubectl get secret  # secret
kubectl get ns      # namespace
kubectl get pv      # persistentvolume
kubectl get pvc     # persistentvolumeclaim
kubectl get ing     # ingress
```

---

## 4. YAML 配置清单

### 通用结构

```yaml
apiVersion: apps/v1            # API 版本（因资源类型而异）
kind: Deployment               # 资源类型
metadata:
  name: my-app                 # 资源名称
  labels:
    app: my-app                # 标签（选择器使用）
  namespace: default           # 命名空间（默认）
spec:
  # ... 资源规约（依 kind 而异）
```

### 常用 apiVersion

| 资源 | apiVersion |
|------|-----------|
| Pod, Service, ConfigMap, Secret, PersistentVolumeClaim | `v1` |
| Deployment, ReplicaSet, DaemonSet, StatefulSet | `apps/v1` |
| Ingress | `networking.k8s.io/v1` |
| PersistentVolume | `v1` |
| Namespace, Node, ResourceQuota | `v1` |
| ClusterRole, ClusterRoleBinding, Role, RoleBinding | `rbac.authorization.k8s.io/v1` |
| HorizontalPodAutoscaler | `autoscaling/v2` |
| CronJob | `batch/v1` |

### 快速生成 YAML 模板

```bash
# 干运行 + 输出 YAML（不实际创建）
kubectl create deployment nginx --image=nginx --dry-run=client -o yaml

# 导出已有资源的 YAML
kubectl get deploy nginx -o yaml

# 导出时剥离状态等元数据
kubectl get deploy nginx -o yaml --export
```

---

## 5. Pod

Pod 是 K8s 的最小部署单元，包含一个或多个共享网络/存储的容器。

### 单容器 Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:alpine
    ports:
    - containerPort: 80
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```

### 多容器 Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: sidecar-pod
spec:
  containers:
  - name: app
    image: my-app:latest
    ports:
    - containerPort: 3000
  - name: sidecar
    image: nginx:alpine
    ports:
    - containerPort: 80
```

多容器共享同一网络命名空间（可通过 `localhost` 通信）和存储卷。

### Init 容器

在应用容器启动前执行初始化任务（如数据库迁移、权限设置）：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: init-pod
spec:
  initContainers:
  - name: init-myservice
    image: busybox:1.28
    command: ['sh', '-c', 'sleep 5']
  containers:
  - name: main-app
    image: nginx:alpine
```

### Pod 生命周期

| 阶段 | 说明 |
|------|------|
| `Pending` | 已提交，但尚未调度或拉取镜像 |
| `Running` | 至少有一个容器正在运行 |
| `Succeeded` | 所有容器正常退出（Job） |
| `Failed` | 容器异常退出 |
| `CrashLoopBackOff` | 容器反复崩溃重启 |
| `ImagePullBackOff` | 镜像拉取失败 |
| `Unknown` | 与节点失联 |

### 容器探针（Probe）

```yaml
spec:
  containers:
  - name: app
    livenessProbe:           # 存活探针（失败则重启容器）
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 5
    readinessProbe:          # 就绪探针（失败则从 Service 摘除）
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 3
      periodSeconds: 5
    startupProbe:            # 启动探针（慢启动容器用）
      httpGet:
        path: /startup
        port: 8080
      initialDelaySeconds: 1
      periodSeconds: 2
      failureThreshold: 30   # 允许 30×2 = 60s 启动时间
```

探针类型：`httpGet`、`tcpSocket`、`exec`（执行命令判断退出码）。

---

## 6. 控制器

### 6.1 Deployment（无状态应用）

Deployment 管理 ReplicaSet，提供声明式更新、滚动更新、回滚。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: nginx
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
        env:
        - name: APP_ENV
          value: production
```

#### 滚动更新

```bash
# 更新镜像
kubectl set image deployment/web-app nginx=nginx:1.26-alpine

# 或编辑 YAML
kubectl edit deployment/web-app

# 查看更新状态
kubectl rollout status deployment/web-app

# 查看更新历史
kubectl rollout history deployment/web-app

# 回滚到上一版本
kubectl rollout undo deployment/web-app

# 回滚到指定版本
kubectl rollout undo deployment/web-app --to-revision=2

# 暂停/恢复
kubectl rollout pause deployment/web-app
kubectl rollout resume deployment/web-app
```

#### 更新策略

```yaml
spec:
  strategy:
    type: RollingUpdate  # 默认，滚动更新
    rollingUpdate:
      maxUnavailable: 1       # 更新时最大不可用 Pod 数量
      maxSurge: 1             # 更新时可超过期望副本数
  # 或
  # type: Recreate             # 重建策略（先删后建）
```

### 6.2 StatefulSet（有状态应用）

适用于数据库、消息队列等需要稳定网络标识和持久存储的应用。

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql-h
  replicas: 2
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: root123
        volumeMounts:
        - name: data
          mountPath: /var/lib/mysql
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

特点：
- Pod 名称为 `<statefulset-name>-<ordinal>`（如 `mysql-0`、`mysql-1`）
- 每个 Pod 有稳定的网络标识（DNS 名）
- 通过 `volumeClaimTemplates` 自动创建 PVC
- 有序部署/缩放/删除

### 6.3 DaemonSet（每个节点运行一个 Pod）

用于日志收集（Fluentd）、监控（Prometheus Node Exporter）、网络插件等。

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
spec:
  selector:
    matchLabels:
      name: fluentd
  template:
    metadata:
      labels:
        name: fluentd
    spec:
      containers:
      - name: fluentd
        image: fluentd:latest
        volumeMounts:
        - name: varlog
          mountPath: /var/log
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
```

### 6.4 Job / CronJob（批处理任务）

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi-job
spec:
  completions: 5          # 需要成功执行 5 次
  parallelism: 2          # 并行数
  template:
    spec:
      containers:
      - name: pi
        image: perl:5.34
        command: ["perl", "-Mbignum=bpi", "-wle", "print bpi(2000)"]
      restartPolicy: Never
  backoffLimit: 4          # 失败重试次数
```

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: backup-job
spec:
  schedule: "0 2 * * *"    # 每天凌晨 2 点
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: busybox
            command: ["sh", "-c", "echo backup done"]
          restartPolicy: Never
```

---

## 7. Service 与网络

### 7.1 Service 类型

| 类型 | 说明 | 访问方式 |
|------|------|---------|
| `ClusterIP`（默认） | 集群内部虚拟 IP，Pod 间访问 | `svc-name.ns.svc.cluster.local` |
| `NodePort` | 每个节点开放静态端口（30000-32767） | `node-ip:NodePort` |
| `LoadBalancer` | 云供应商负载均衡器（AWS ELB / GCLB） | 外部 LB 域名 |
| `ExternalName` | DNS CNAME 映射 | 返回 `external-name` 的 CNAME |

### 7.2 ClusterIP Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-svc
spec:
  selector:
    app: web-app
  ports:
  - protocol: TCP
    port: 80          # Service 端口
    targetPort: 8080  # Pod 容器端口
```

### 7.3 NodePort Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-nodeport
spec:
  type: NodePort
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080   # 可选，不指定则随机分配
```

### 7.4 LoadBalancer Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-lb
spec:
  type: LoadBalancer
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 8080
```

Minikube 中通过 `minikube tunnel` 模拟 LoadBalancer。

### 7.5 Headless Service

用于 StatefulSet 的稳定网络标识：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql-h
spec:
  clusterIP: None          # Headless
  selector:
    app: mysql
  ports:
  - port: 3306
```

Pod DNS：`mysql-0.mysql-h.namespace.svc.cluster.local`

### 7.6 服务发现

- **环境变量**：创建 Pod 时注入 `<SVCNAME>_SERVICE_HOST` / `_PORT`
- **DNS**（推荐）：CoreDNS 自动注册 Service DNS 记录

```bash
# 验证 DNS 解析（在 Pod 内）
nslookup web-svc
nslookup web-svc.default.svc.cluster.local
```

---

## 8. 配置与密钥

### 8.1 ConfigMap（明文配置）

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: production
  LOG_LEVEL: info
  nginx.conf: |             # 多行配置
    server {
      listen 80;
      location / {
        proxy_pass http://localhost:3000;
      }
    }
```

```yaml
# 从字面值创建
kubectl create configmap app-config --from-literal=APP_ENV=production --from-literal=LOG_LEVEL=info

# 从文件创建
kubectl create configmap app-config --from-file=nginx.conf
```

#### 注入 Pod

```yaml
spec:
  containers:
  - name: app
    # 方式 1：环境变量
    env:
    - name: APP_ENV
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: APP_ENV
    # 方式 2：全部 env
    envFrom:
    - configMapRef:
        name: app-config
```

```yaml
spec:
  containers:
  - name: nginx
    # 方式 3：挂载为文件
    volumeMounts:
    - name: config
      mountPath: /etc/nginx/conf.d/
      readOnly: true
  volumes:
  - name: config
    configMap:
      name: app-config
      items:
      - key: nginx.conf
        path: default.conf
```

### 8.2 Secret（Base64 编码敏感数据）

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  username: cm9vdA==        # root
  password: cGFzc3dvcmQxMjM=  # password123
stringData:                   # 纯文本（自动编码）
  host: mysql.example.com
```

```bash
# 从字面值创建
kubectl create secret generic db-secret --from-literal=username=root --from-literal=password=password123

# 从文件创建
kubectl create secret generic tls-secret --from-file=tls.crt=tls.crt --from-file=tls.key=tls.key

# 创建 TLS 类型 Secret（用于 Ingress）
kubectl create secret tls tls-secret --cert=tls.crt --key=tls.key

# 创建 Docker 仓库凭证
kubectl create secret docker-registry regcred --docker-server=registry.cn-hangzhou.aliyuncs.com --docker-username=xxx --docker-password=xxx
```

#### 注入 Pod

```yaml
spec:
  containers:
  - name: app
    env:
    - name: DB_USER
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: username
    envFrom:
    - secretRef:
        name: db-secret
    volumeMounts:
    - name: secret-volume
      mountPath: /etc/credentials
      readOnly: true
  volumes:
  - name: secret-volume
    secret:
      secretName: db-secret
```

> Secret 仅做 base64 编码，非加密。生产环境应使用外部密钥管理（Vault、AWS Secrets Manager）配合 [Secrets Store CSI Driver](https://secrets-store-csi-driver.sigs.k8s.io/)。

---

## 9. 存储

### 9.1 emptyDir（临时存储，与 Pod 同生命周期）

```yaml
spec:
  containers:
  - name: app
    volumeMounts:
    - mountPath: /cache
      name: cache-volume
  volumes:
  - name: cache-volume
    emptyDir:
      sizeLimit: 500Mi
```

### 9.2 hostPath（节点本地文件系统）

```yaml
volumes:
- name: docker-socket
  hostPath:
    path: /var/run/docker.sock
    type: Socket
```

### 9.3 PersistentVolume / PersistentVolumeClaim

```yaml
# PV（由管理员提供）
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-local
spec:
  capacity:
    storage: 10Gi
  accessModes:
  - ReadWriteOnce
  hostPath:
    path: /mnt/data
  storageClassName: manual
```

```yaml
# PVC（由用户申请）
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-local
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: manual
```

```yaml
# Pod 使用 PVC
spec:
  containers:
  - name: app
    volumeMounts:
    - mountPath: /data
      name: app-storage
  volumes:
  - name: app-storage
    persistentVolumeClaim:
      claimName: pvc-local
```

### 访问模式

| 模式 | 说明 |
|------|------|
| `ReadWriteOnce` | 单节点读写 |
| `ReadOnlyMany` | 多节点只读 |
| `ReadWriteMany` | 多节点读写（需存储后端支持，如 NFS） |

### StorageClass（动态供应）

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  fsType: ext4
```

PVC 省略 `storageClassName` 则使用默认 StorageClass。

---

## 10. 命名空间与资源隔离

```bash
# 创建命名空间
kubectl create ns dev
kubectl create ns prod

# 切换默认命名空间（kubectl 上下文）
kubectl config set-context --current --namespace=dev

# 查看命名空间下资源
kubectl get all -n dev
```

### 资源配额（ResourceQuota）

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: dev-quota
  namespace: dev
spec:
  hard:
    requests.cpu: 2
    requests.memory: 4Gi
    limits.cpu: 4
    limits.memory: 8Gi
    pods: 10
    persistentvolumeclaims: 3
    configmaps: 10
```

### 限制范围（LimitRange）

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: dev-limits
  namespace: dev
spec:
  limits:
  - default:
      cpu: 500m
      memory: 256Mi
    defaultRequest:
      cpu: 200m
      memory: 128Mi
    type: Container
```

---

## 11. Ingress

Ingress 将外部 HTTP/HTTPS 流量路由到集群内 Service（需安装 Ingress Controller）。

### 安装 Ingress Controller

```bash
# Minikube
minikube addons enable ingress

# 通用（Nginx Ingress Controller）
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

### 基本路由

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-svc
            port:
              number: 80
```

### 多路径路由

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: multi-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-svc
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-svc
            port:
              number: 80
```

### TLS 配置

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - secure.example.com
    secretName: tls-secret
  rules:
  - host: secure.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-svc
            port:
              number: 80
```

### 注解常用功能

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /    # 路径重写
    nginx.ingress.kubernetes.io/ssl-redirect: "false"  # 禁用 HTTPS 重定向
    nginx.ingress.kubernetes.io/cors-enabled: "true"    # 启用 CORS
    nginx.ingress.kubernetes.io/proxy-body-size: 10m    # 请求体大小限制
    nginx.ingress.kubernetes.io/limit-rps: "100"        # 限速
```

### 本地调试 Ingress

```bash
# 修改 hosts 文件
echo "127.0.0.1 app.example.com" | sudo tee -a /etc/hosts

# Minikube 获取 ingress 地址
minikube ip
```

---

## 12. Helm 包管理

### 安装

```bash
# Windows
winget install Helm

# macOS / Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `helm repo add <name> <url>` | 添加 Chart 仓库 |
| `helm repo update` | 更新仓库索引 |
| `helm search repo <keyword>` | 搜索 Chart |
| `helm install <release> <chart>` | 安装 Chart |
| `helm upgrade <release> <chart>` | 升级 |
| `helm rollback <release> <revision>` | 回滚 |
| `helm uninstall <release>` | 卸载 |
| `helm list` | 列出已安装的 Release |
| `helm get values <release>` | 查看 Release 配置值 |
| `helm template <release> <chart>` | 本地渲染模板预览 |

### 快速上手

```bash
# 添加常用仓库
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add stable https://charts.helm.sh/stable
helm repo update

# 安装 nginx
helm install my-nginx bitnami/nginx

# 安装时自定义值
helm install my-nginx bitnami/nginx --set service.type=NodePort --set replicaCount=3

# 使用 values 文件
helm install my-nginx bitnami/nginx -f my-values.yaml

# 升级
helm upgrade my-nginx bitnami/nginx --set replicaCount=5

# 查看历史版本
helm history my-nginx

# 回滚
helm rollback my-nginx 1
```

### 创建自己的 Chart

```bash
helm create my-chart
```

目录结构：

```
my-chart/
├── Chart.yaml          # 元数据（name, version, description）
├── values.yaml         # 默认配置值
├── charts/             # 子 Chart 依赖
└── templates/          # Go 模板文件
    ├── deployment.yaml
    ├── service.yaml
    ├── ingress.yaml
    ├── _helpers.tpl    # 模板辅助函数
    └── tests/          # 测试
```

---

## 13. RBAC 权限控制

### 核心对象

| 对象 | 说明 |
|------|------|
| ServiceAccount | Pod 的身份（非人用户） |
| Role | 命名空间内权限规则集合 |
| ClusterRole | 集群级权限规则集合 |
| RoleBinding | Role 绑定到用户/ServiceAccount（命名空间内） |
| ClusterRoleBinding | ClusterRole 绑定（集群级） |

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
  namespace: default
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
- kind: ServiceAccount
  name: app-sa
  namespace: default
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### 常用 verbs

`get`、`list`、`watch`、`create`、`update`、`patch`、`delete`

### 在 Pod 中使用 ServiceAccount

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  serviceAccountName: app-sa
  containers:
  - name: app
    image: alpine
    command: ["sleep", "3600"]
```

Pod 内可通过 `/var/run/secrets/kubernetes.io/serviceaccount/` 的 Token 与 API Server 交互。

### 快速创建 ServiceAccount 并绑定

```bash
# 创建 ServiceAccount
kubectl create sa app-sa

# 创建 Role + RoleBinding
kubectl create role pod-reader --verb=get,list,watch --resource=pods
kubectl create rolebinding app-sa-binding --role=pod-reader --serviceaccount=default:app-sa

# 创建 ClusterRole + ClusterRoleBinding
kubectl create clusterrole node-reader --verb=get,list,watch --resource=nodes
kubectl create clusterrolebinding app-sa-cluster-binding --clusterrole=node-reader --serviceaccount=default:app-sa
```

---

## 14. 监控与排错

### 14.1 基础排错

```bash
# 查看 Pod 状态
kubectl get pod
kubectl describe pod <pod-name>

# 查看日志
kubectl logs <pod-name>
kubectl logs <pod-name> -c <container>
kubectl logs --tail=100 -f <pod-name>

# Pod 事件
kubectl get events --sort-by='.lastTimestamp'

# 节点状态
kubectl get nodes -o wide
kubectl describe node <node-name>

# 节点资源占用
kubectl top node
kubectl top pod

# 调试 Pod（临时启动工具箱容器）
kubectl run debug --image=nicolaka/netshoot -it --rm -- /bin/bash
```

### 14.2 常用排查场景

| 症状 | 排查命令 |
|------|---------|
| Pod 一直 Pending | `kubectl describe pod <pod>` 看 Events → 资源不足/镜像拉取失败 |
| Pod CrashLoopBackOff | `kubectl logs <pod>`、`kubectl logs --previous <pod>` |
| Pod 启动后无响应 | `kubectl exec -it <pod> -- sh` 手动检查 |
| Service 不通 | `kubectl get endpoints` 检查是否有 Endpoint |
| DNS 解析异常 | `kubectl run dns --image=busybox -- nslookup kubernetes.default` |
| 证书错误 | `kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller` |

### 14.3 Metrics Server

```bash
# 安装 Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# 如果证书问题（Minikube 常用）
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'

# 查看资源使用
kubectl top pod
kubectl top node
```

### 14.4 Dashboard

```bash
# Minikube
minikube dashboard

# 通用部署
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml

# 访问（需 Token）
kubectl -n kubernetes-dashboard create token admin-user
kubectl -n kubernetes-dashboard port-forward svc/kubernetes-dashboard 8080:80
# 浏览器访问 http://localhost:8080
```

### 14.5 常用第三方工具

| 工具 | 用途 | 安装 |
|------|------|------|
| `k9s` | TUI 管理工具 | `winget install k9s` |
| `lens` | 桌面端 GUI 管理 | 官网下载 |
| `stern` | 多 Pod 日志聚合 | `winget install stern` |
| `kubectx` / `kubens` | 快速切换上下文/命名空间 | `winget install kubectx` |

```bash
# k9s 使用
k9s                # 启动 TUI
# 快捷键: :pod / :deploy / :svc → 筛选资源
#         d → describe, l → logs, e → edit, y → YAML

# stern（模糊匹配 Pod 名，聚合日志）
stern -n default web

# kubectx / kubens
kubectx            # 切换集群上下文
kubens             # 切换命名空间
```

---

## 15. 实战：部署完整应用

### 部署一个 Nginx + API 应用

```yaml
# 1. ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: production
  API_URL: http://api-svc:8080
---
# 2. Secret
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
stringData:
  DB_PASSWORD: change_me_in_prod
---
# 3. Deployment - Web
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  labels:
    app: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        envFrom:
        - configMapRef:
            name: app-config
---
# 4. Service - Web
apiVersion: v1
kind: Service
metadata:
  name: web-svc
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
---
# 5. Deployment - API
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels:
    app: api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: your-api-image:latest
        ports:
        - containerPort: 8080
        env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: DB_PASSWORD
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 3
          periodSeconds: 5
---
# 6. Service - API
apiVersion: v1
kind: Service
metadata:
  name: api-svc
spec:
  selector:
    app: api
  ports:
  - port: 8080
    targetPort: 8080
---
# 7. Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.local
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-svc
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-svc
            port:
              number: 80
```

### 部署命令

```bash
# 一次性部署所有资源
kubectl apply -f .

# 验证
kubectl get all
kubectl get ingress
kubectl describe ingress app-ingress

# 本地测试
kubectl port-forward svc/web-svc 8080:80

# 删除
kubectl delete -f .
```

---

## 附：常用 kubectl 别名

```powershell
# PowerShell 配置 ($PROFILE)
function kgp { kubectl get pod @args }
function kgd { kubectl get deployment @args }
function kgs { kubectl get svc @args }
function kga { kubectl get all @args }
function k { kubectl @args }
function kc { kubectl config set-context --current --namespace=$args[0] }

# Bash/Ksh
alias k='kubectl'
alias kgp='kubectl get pod'
alias kgd='kubectl get deployment'
alias kgs='kubectl get svc'
alias kga='kubectl get all'
alias kc='kubectl config set-context --current --namespace'
```

## 附：常用端口

| 组件 | 端口 |
|------|------|
| API Server | 6443 |
| etcd | 2379-2380 |
| Kubelet | 10250 |
| Scheduler | 10259 |
| Controller Manager | 10257 |
| NodePort 范围 | 30000-32767 |
| CoreDNS | 53 (UDP/TCP) |
