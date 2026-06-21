# Node.js 学习笔记

## 目录

1. [Node.js 简介](#1-nodejs-简介)
2. [模块系统](#2-模块系统)
3. [内置核心模块](#3-内置核心模块)
4. [npm 包管理](#4-npm-包管理)
5. [异步编程](#5-异步编程)
6. [Express 框架](#6-express-框架)
7. [工程化实践](#7-工程化实践)
8. [常见面试题](#8-常见面试题)

---

## 1. Node.js 简介

- **运行时**：基于 Chrome V8 引擎的 JavaScript 运行时
- **特点**：事件驱动、非阻塞 I/O、单线程（但通过 libuv 实现异步）
- **适用场景**：API 服务、实时应用、工具链、微服务
- **不适用**：CPU 密集型任务（可用 worker_threads 或 C++ addon）

## 2. 模块系统

### CommonJS（默认）

```js
// 导出
module.exports = { foo };
exports.bar = bar;

// 导入
const mod = require('./module');
```

### ES Module（需设置 `"type": "module"` 或使用 `.mjs`）

```js
// 导出
export default foo;
export { bar };

// 导入
import foo, { bar } from './module.mjs';
```

### 模块查找规则

1. 内置模块优先
2. `./` 或 `../` 开头 → 相对路径文件或目录
3. 其他 → `node_modules` 逐级向上查找

## 3. 内置核心模块

| 模块 | 用途 |
|------|------|
| `fs` | 文件系统操作 |
| `path` | 路径处理 |
| `http` / `https` | HTTP 服务端/客户端 |
| `url` | URL 解析 |
| `events` | 事件发射器 |
| `buffer` | 二进制数据处理 |
| `stream` | 流式数据处理 |
| `child_process` | 子进程 |
| `os` | 操作系统信息 |
| `crypto` | 加密 |

### fs 常用 API

```js
const fs = require('node:fs');
const fsP = require('node:fs/promises'); // Promise 版本

// 同步
const data = fs.readFileSync('file.txt', 'utf-8');
fs.writeFileSync('file.txt', 'content');

// 异步回调
fs.readFile('file.txt', 'utf-8', (err, data) => {});
fs.writeFile('file.txt', 'content', (err) => {});

// Promise
const data = await fsP.readFile('file.txt', 'utf-8');
await fsP.writeFile('file.txt', 'content');
```

### path 常用 API

```js
const path = require('node:path');
path.join('a', 'b', 'c');       // a\b\c → 自动处理分隔符
path.resolve('a', 'b', 'c');   // 绝对路径
path.basename('/a/b/c.js');    // c.js
path.dirname('/a/b/c.js');     // /a/b
path.extname('/a/b/c.js');     // .js
```

### http 创建服务器

```js
const http = require('node:http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World');
});
server.listen(3000);
```

## 4. npm 包管理

```bash
npm init -y              # 快速初始化 package.json
npm install <pkg>        # 安装依赖
npm install <pkg> --save-dev  # 开发依赖
npm uninstall <pkg>      # 卸载
npm update               # 更新
npm run <script>         # 运行脚本
```

### package.json 关键字段

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": { "start": "node index.js" },
  "dependencies": {},
  "devDependencies": {}
}
```

### npm 语义化版本

- `^1.2.3` → 允许 minor/patch 更新（≥1.2.3 <2.0.0）
- `~1.2.3` → 仅允许 patch 更新（≥1.2.3 <1.3.0）
- `1.2.3` → 锁定版本

## 5. 异步编程

### 三种形式

```js
// 1. 回调
fs.readFile('a.txt', cb);

// 2. Promise
fsP.readFile('a.txt').then(data => {});

// 3. async/await（推荐）
const data = await fsP.readFile('a.txt');
```

### Event Loop 阶段顺序

1. **timers**：`setTimeout` / `setInterval`
2. **pending callbacks**：延迟 I/O 回调
3. **idle, prepare**：内部使用
4. **poll**：获取新 I/O 事件（主要阶段）
5. **check**：`setImmediate`
6. **close callbacks**：关闭事件回调

> `process.nextTick` 不属 Event Loop，会在当前阶段结束后、下一阶段前执行。

### 常见异步 API 执行时机

```js
setTimeout(() => {}, 0);       // timers 阶段
setImmediate(() => {});        // check 阶段
process.nextTick(() => {});    // 当前阶段尾部，立即执行
```

## 6. Express 框架

```bash
npm install express
```

### 基础用法

```js
const express = require('express');
const app = express();

app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});

app.use(express.json());           // JSON 解析中间件
app.use(express.static('public')); // 静态文件

// 错误处理中间件（4 参数）
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Error' });
});

app.listen(3000);
```

### 路由参数

```js
app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});
```

### 中间件执行

- 按注册顺序执行
- 通过 `next()` 传递到下一个中间件
- 不调用 `next()` 且不结束响应 → 请求挂起

## 7. 工程化实践

### 7.1 环境变量管理

使用 `dotenv` 加载 `.env` 文件，不同环境使用不同文件。

```bash
npm install dotenv
```

```js
// .env（不提交到 git）
DATABASE_URL=mysql://localhost:3306/mydb
JWT_SECRET=s3cret
REDIS_HOST=127.0.0.1

// .env.example（提交到 git，占位值）
DATABASE_URL=mysql://localhost:3306/mydb
JWT_SECRET=change_me
REDIS_HOST=127.0.0.1
```

```js
// 加载
require('dotenv').config();
// 或指定文件: require('dotenv').config({ path: '.env.production' });

// 使用
const dbUrl = process.env.DATABASE_URL;
const port = parseInt(process.env.PORT, 10) || 3000;
```

**最佳实践**：
- `.env` 加入 `.gitignore`，仅提交 `.env.example`
- 使用 `process.env.NODE_ENV` 区分环境（`development` / `production` / `test`）
- 配合 `joi` 或 `zod` 校验环境变量类型

```js
const { cleanEnv, str, num } = require('envalid');
module.exports = cleanEnv(process.env, {
  PORT:        num({ default: 3000 }),
  DATABASE_URL: str(),
  JWT_SECRET:  str(),
});
```

### 7.2 配置管理

推荐分层结构，按环境拆分：

```
config/
├── default.js        # 公共默认配置
├── development.js    # 开发环境
├── production.js     # 生产环境
├── test.js           # 测试环境
└── index.js          # 入口，按 NODE_ENV 合并
```

```js
// config/index.js
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const env = process.env.NODE_ENV || 'development';
const defaultConfig = require('./default');
const envConfig = require(`./${env}`);

module.exports = { ...defaultConfig, ...envConfig };
```

```js
// config/default.js
module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  db:   { host: process.env.DB_HOST || 'localhost' },
  log:  { level: process.env.LOG_LEVEL || 'info' },
};
```

### 7.3 日志系统

避免裸 `console.log`，使用结构化日志库。

#### Winston

```bash
npm install winston
```

```js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production'
        ? winston.format.json()
        : winston.format.prettyPrint(),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

module.exports = logger;

// 使用
// logger.info('Server started', { port: 3000 });
// logger.error('DB connection failed', { error: err.message });
```

#### HTTP 请求日志（Morgan）

```bash
npm install morgan
```

```js
const morgan = require('morgan');
app.use(morgan('combined'));            // Apache 格式
app.use(morgan(':method :url :status')); // 自定义格式
```

### 7.4 错误处理统一封装

```js
// 自定义错误类
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;           // 可预料的错误
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 处理
app.use((req, res, next) => {
  next(new AppError(`Not Found: ${req.originalUrl}`, 404));
});

// 全局错误中间件
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;

  // 记录日志
  logger.error(err.message, {
    url: req.originalUrl,
    method: req.method,
    stack: err.isOperational ? undefined : err.stack, // 非可预料错误才记录完整栈
  });

  res.status(status).json({
    status: 'error',
    message: err.isOperational ? err.message : 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});
```

### 7.5 进程管理（PM2）

```bash
npm install -g pm2

pm2 start index.js           # 启动
pm2 start index.js -i max    # 集群模式（CPU 全核）
pm2 list                     # 进程列表
pm2 logs                     # 实时日志
pm2 restart app              # 重启
pm2 stop app                 # 停止
pm2 delete app               # 删除进程
pm2 save                     # 保存进程列表
pm2 startup                  # 设置开机自启
```

**配置文件 `ecosystem.config.js`**：

```js
module.exports = {
  apps: [{
    name: 'my-api',
    script: 'index.js',
    instances: 'max',           // 或数字，max = CPU 核心数
    exec_mode: 'cluster',       // cluster 模式
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    max_memory_restart: '500M', // 内存超限自动重启
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    merge_logs: true,
    watch: false,               // 开发时可开启
  }],
};
```

### 7.6 Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER appuser
EXPOSE 3000
CMD ["node", "index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

```bash
# 构建与运行
docker compose build
docker compose up -d
docker compose logs -f
docker compose down
```

### 7.7 安全实践

```bash
npm install helmet               # HTTP 安全头
npm install express-rate-limit   # 请求频率限制
npm install cors                 # 跨域
npm install express-mongo-sanitize # NoSQL 注入防护
npm install xss-clean            # XSS 清洗
npm install hpp                  # 参数污染防护
```

```js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }));
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,     // 15 分钟
  max: 100,                      // 最多 100 次请求
  message: 'Too many requests, please try again later.',
}));
```

**其他要点**：
- 始终使用 `HTTPS`（生产环境通过反向代理终止 TLS）
- `JWT` 设置合理过期时间，密钥使用环境变量
- 用户密码使用 `bcrypt` 哈希（`npm install bcrypt`）
- SQL 查询使用参数化查询或 ORM，禁止拼接字符串
- `npm audit` 定期检查依赖漏洞

### 7.8 测试

```bash
npm install -D jest supertest
```

```js
// __tests__/api.test.js
const request = require('supertest');
const app = require('../app'); // 注意：app 和 server 分开导出

describe('GET /api/users', () => {
  it('should return user list', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
```

```json
// package.json
{ "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch"
} }
```

### 7.9 性能与监控

| 工具 | 用途 |
|------|------|
| `clinic` | Node.js 性能分析（火焰图、事件循环延迟） |
| `0x` | 火焰图生成 |
| `node --inspect` | Chrome DevTools 调试 |
| `express-status-monitor` | 实时请求/内存/CPU 面板 |
| `Sentry` / `Datadog` | 生产错误监控 |

```bash
# 火焰图
npm install -g 0x
0x index.js

# Clinic 诊断
npm install -g clinic
clinic doctor -- node index.js
```

### 7.10 项目目录结构推荐

```
project/
├── src/
│   ├── config/          # 配置
│   ├── controllers/     # 路由处理函数
│   ├── middleware/       # 中间件
│   ├── models/          # 数据模型（Sequelize / Prisma / Mongoose）
│   ├── routes/          # 路由定义
│   ├── services/        # 业务逻辑
│   ├── utils/           # 工具函数
│   ├── validators/      # 请求校验（Joi / Zod）
│   └── app.js           # Express 应用（不 listen）
├── tests/
│   ├── unit/
│   └── integration/
├── logs/
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── ecosystem.config.js
├── package.json
└── index.js             # 入口：加载 app.js + listen
```

**关键原则**：
- `app.js` 不调用 `listen()`，方便测试时 supertest 直接导入
- `index.js` 作为唯一入口，负责 `listen()` 和 `process.on` 全局处理
- 路由只做分发，业务逻辑放在 `services/`
- 中间件按职责拆分文件

## 8. 常见面试题

| 问题 | 要点 |
|------|------|
| Node.js 为什么是单线程？ | 避免多线程锁/上下文切换开销；异步 I/O 由 libuv 线程池处理 |
| 如何实现高并发？ | 事件循环 + 非阻塞 I/O，少量线程处理大量连接 |
| CommonJS 和 ES Module 区别 | CJS 是运行时加载、同步、值拷贝；ESM 是编译时加载、异步、引用 |
| `process.nextTick` vs `setImmediate` | nextTick 立即执行，先于 setImmediate；setImmediate 在 check 阶段执行 |
| 如何处理未捕获异常？ | `process.on('uncaughtException')` 和 `unhandledRejection`，但建议 crash 后重启 |
| Stream 的几种类型 | Readable、Writable、Transform、Duplex |
| Buffer 与 TypedArray 关系 | Buffer 继承自 Uint8Array |
