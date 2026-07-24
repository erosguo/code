# JavaScript 内存管理

## 目录

1. [内存生命周期](#1-内存生命周期)
2. [栈内存与堆内存](#2-栈内存与堆内存)
3. [垃圾回收机制](#3-垃圾回收机制)
4. [常见内存泄漏模式](#4-常见内存泄漏模式)
5. [V8 引擎内存管理](#5-v8-引擎内存管理)
6. [内存调试工具](#6-内存调试工具)
7. [内存优化最佳实践](#7-内存优化最佳实践)

---

## 1. 内存生命周期

JavaScript 内存管理遵循三个阶段：

### 1.1 分配阶段

JavaScript 引擎自动分配内存，无需手动操作：

```typescript
const num = 42;
const str = 'hello';
const obj = { name: 'Alice' };
const arr = [1, 2, 3];
function fn() {}
```

### 1.2 使用阶段

读取和写入已分配的内存：

```typescript
console.log(num);
obj.name = 'Bob';
arr.push(4);
```

### 1.3 释放阶段

由垃圾回收器（GC）自动回收不再使用的内存。开发者无法直接控制，但可以通过消除引用来帮助 GC。

---

## 2. 栈内存与堆内存

### 2.1 栈内存 (Stack)

- **存储内容**：基本类型值、函数调用栈
- **特点**：大小固定、访问速度快、自动分配和释放
- **空间**：较小（通常几 MB）

```typescript
function add(a: number, b: number): number {
  const sum = a + b;
  return sum;
}

const result = add(1, 2);
```

执行流程：
1. `add(1, 2)` 入栈，`a=1`, `b=2`
2. `sum=3` 入栈
3. 返回 `sum`，函数调用出栈，局部变量自动释放

### 2.2 堆内存 (Heap)

- **存储内容**：对象、数组、函数等引用类型
- **特点**：大小不固定、访问速度较慢、手动管理（通过 GC）
- **空间**：较大（可达 GB 级）

```typescript
const person = { name: 'Alice', age: 30 };
const numbers = [1, 2, 3, 4, 5];
```

栈中存储指向堆内存的引用地址，堆中存储实际数据。

### 2.3 示例对比

```typescript
function example() {
  const primitive = 'hello';
  const reference = { value: 'world' };
  
  return { primitive, reference };
}

const result = example();
// primitive 在栈中，reference 在堆中
// 函数执行完毕后，primitive 自动释放
// reference 需要等待 GC 回收
```

---

## 3. 垃圾回收机制

### 3.1 引用计数 (Reference Counting)

**原理**：跟踪每个值被引用的次数，当引用次数为 0 时回收。

```typescript
let obj1 = { name: 'Alice' };
let obj2 = obj1;

obj1 = null;
// 引用计数：1（obj2 仍引用）

obj2 = null;
// 引用计数：0 → 可以被回收
```

**循环引用问题**：

```typescript
function createCycle() {
  const objA: any = {};
  const objB: any = {};
  
  objA.child = objB;
  objB.parent = objA;
  
  return null;
}

createCycle();
// objA 和 objB 相互引用，引用计数永远不为 0
// 但现代引擎已解决此问题
```

### 3.2 标记清除 (Mark-and-Sweep)

**原理**：从根对象（全局对象、调用栈）出发，标记所有可达对象，清除未标记对象。

**标记阶段**：

```typescript
const globalObj = {
  active: { data: 'important' },
  unused: { data: 'garbage' }
};

// 标记：globalObj → active（可达）
// 未标记：unused（不可达，将被清除）
```

**清除阶段**：回收未标记的内存空间。

**优点**：解决循环引用问题。

**缺点**：可能产生内存碎片。

### 3.3 标记整理 (Mark-and-Compact)

在标记清除基础上增加整理步骤，将存活对象移动到内存一端，减少碎片。

---

## 4. 常见内存泄漏模式

### 4.1 全局变量

```typescript
function badFunction() {
  leakVar = 'I will leak!';
}

badFunction();
// leakVar 成为全局变量，不会被回收
```

**修复**：

```typescript
function goodFunction() {
  const leakVar = 'I will not leak';
}
```

### 4.2 闭包泄漏

```typescript
function createClosure() {
  const largeData = new Array(1000000).fill('data');
  
  return function() {
    console.log('I keep largeData alive');
  };
}

const closure = createClosure();
// largeData 被闭包引用，无法回收
```

**修复**：

```typescript
function createClosure() {
  return function() {
    console.log('I do not keep largeData alive');
  };
}
```

### 4.3 定时器泄漏

```typescript
const data = { important: 'data' };

setInterval(() => {
  console.log(data.important);
}, 1000);

// data 被定时器回调引用，无法回收
// 即使不再需要
```

**修复**：

```typescript
const intervalId = setInterval(() => {
  console.log(data.important);
}, 1000);

clearInterval(intervalId);
```

### 4.4 事件监听器泄漏

```typescript
const button = document.getElementById('btn');

button.addEventListener('click', () => {
  console.log('Clicked');
});

// 按钮被移除后，监听器仍存在
```

**修复**：

```typescript
const handler = () => console.log('Clicked');

button.addEventListener('click', handler);
button.removeEventListener('click', handler);
```

### 4.5 分离的 DOM 节点

```typescript
const container = document.getElementById('container');
const list = container.querySelectorAll('li');

document.body.removeChild(container);
// container 已从 DOM 移除
// 但 list 仍持有对 li 元素的引用，无法回收
```

**修复**：

```typescript
document.body.removeChild(container);
// 手动释放引用
const list = null;
```

### 4.6 缓存泄漏

```typescript
const cache = new Map();

function getData(key: string) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = fetchData(key);
  cache.set(key, data);
  return data;
}

// 缓存无限增长，从不清理
```

**修复**：

```typescript
const cache = new Map<string, { data: any, timestamp: number }>();

function getData(key: string) {
  if (cache.has(key)) {
    return cache.get(key)?.data;
  }
  
  const data = fetchData(key);
  cache.set(key, { data, timestamp: Date.now() });
  
  if (cache.size > 100) {
    const oldestKey = Array.from(cache.keys()).sort(
      (a, b) => cache.get(a)!.timestamp - cache.get(b)!.timestamp
    )[0];
    cache.delete(oldestKey);
  }
  
  return data;
}
```

---

## 5. V8 引擎内存管理

### 5.1 分代垃圾回收

V8 将堆分为新生代和老生代：

#### 新生代 (Young Generation)

- **对象类型**：新创建的对象
- **特点**：存活时间短、空间小（1-8 MB）
- **回收算法**：Scavenge（复制算法）

**Scavenge 算法**：
1. 将新生代堆分为 From 空间和 To 空间
2. 标记存活对象，复制到 To 空间
3. 交换 From 和 To 空间
4. 清除原 From 空间

#### 老生代 (Old Generation)

- **对象类型**：存活时间长的对象
- **特点**：空间大、存活对象多
- **回收算法**：Mark-Sweep + Mark-Compact

### 5.2 晋升机制

当新生代对象经历多次 Scavenge 后，会晋升到老生代：

```typescript
function createLongLivedObject() {
  let obj = { count: 0 };
  
  for (let i = 0; i < 10; i++) {
    obj.count++;
    // 对象经历多次 GC 后晋升到老生代
  }
  
  return obj;
}
```

### 5.3 Orinoco 垃圾回收器

V8 的新一代 GC 系统，特点：
- 并行标记：多线程同时标记
- 并发标记：与 JavaScript 执行交替进行
- 增量标记：将标记工作分成小块

---

## 6. 内存调试工具

### 6.1 Chrome DevTools Memory 面板

#### Heap Snapshot（堆快照）

```typescript
// 1. 打开 DevTools → Memory
// 2. 点击 Take snapshot
// 3. 分析对象分配和内存占用
```

#### Allocation Instrumenter（分配跟踪）

```typescript
// 1. 选择 Allocation instrumentation on timeline
// 2. 开始录制
// 3. 执行操作
// 4. 查看内存分配时间线
```

#### Allocation Sampling（分配采样）

适合长时间运行的应用，低开销采样分析。

### 6.2 Performance 面板

```typescript
// 1. 打开 Performance
// 2. 录制一段时间
// 3. 查看 GC 事件（紫色柱状图）
// 4. 分析 GC 频率和耗时
```

### 6.3 命令行工具

```typescript
// Node.js --inspect
node --inspect app.js

// 在 Chrome 中访问 chrome://inspect
```

### 6.4 实用代码检测

```typescript
class MemoryMonitor {
  private threshold: number;
  
  constructor(thresholdMB: number) {
    this.threshold = thresholdMB * 1024 * 1024;
  }
  
  check(): void {
    const usage = process.memoryUsage();
    
    if (usage.heapUsed > this.threshold) {
      console.warn('Memory usage exceeds threshold:', usage.heapUsed);
    }
    
    console.log({
      rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`
    });
  }
}

const monitor = new MemoryMonitor(500);
setInterval(() => monitor.check(), 5000);
```

---

## 7. 内存优化最佳实践

### 7.1 对象池模式

```typescript
class ObjectPool<T> {
  private pool: T[] = [];
  private creator: () => T;
  
  constructor(creator: () => T) {
    this.creator = creator;
  }
  
  acquire(): T {
    return this.pool.pop() || this.creator();
  }
  
  release(obj: T): void {
    this.pool.push(obj);
  }
}

interface Particle {
  x: number;
  y: number;
  velocity: number;
}

const particlePool = new ObjectPool<Particle>(() => ({
  x: 0,
  y: 0,
  velocity: 0
}));

function createParticle(x: number, y: number): Particle {
  const particle = particlePool.acquire();
  particle.x = x;
  particle.y = y;
  particle.velocity = 1;
  return particle;
}

function destroyParticle(particle: Particle): void {
  particlePool.release(particle);
}
```

### 7.2 WeakMap 和 WeakSet

```typescript
// WeakMap 的键是弱引用，不会阻止 GC
const weakCache = new WeakMap();

function cacheObject(obj: object, data: any): void {
  weakCache.set(obj, data);
}

let myObj = { id: 1 };
cacheObject(myObj, { details: 'info' });

myObj = null;
// obj 被回收后，WeakMap 中的条目自动消失
```

### 7.3 避免不必要的 DOM 操作

```typescript
// 不好的做法
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  document.body.appendChild(div);
}

// 好的做法
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  fragment.appendChild(div);
}

document.body.appendChild(fragment);
```

### 7.4 使用解构和局部变量

```typescript
// 不好的做法
function processItems(items: any[]) {
  for (let i = 0; i < items.length; i++) {
    console.log(items[i].name);
  }
}

// 好的做法
function processItems(items: any[]) {
  const len = items.length;
  
  for (let i = 0; i < len; i++) {
    const item = items[i];
    console.log(item.name);
  }
}
```

### 7.5 及时释放资源

```typescript
class ResourceManager {
  private resources: Map<string, any> = new Map();
  
  allocate(key: string, resource: any): void {
    this.resources.set(key, resource);
  }
  
  release(key: string): void {
    const resource = this.resources.get(key);
    
    if (resource) {
      if (typeof resource.dispose === 'function') {
        resource.dispose();
      }
      
      if (typeof resource.close === 'function') {
        resource.close();
      }
      
      this.resources.delete(key);
    }
  }
  
  releaseAll(): void {
    this.resources.forEach((resource, key) => {
      this.release(key);
    });
  }
}
```

---

## 总结

JavaScript 内存管理的核心要点：

1. **理解内存生命周期**：分配 → 使用 → 释放
2. **区分栈和堆**：基本类型在栈，引用类型在堆
3. **信任 GC 但不依赖 GC**：避免产生垃圾，及时清理引用
4. **警惕泄漏模式**：全局变量、闭包、定时器、事件监听器
5. **利用工具诊断**：Chrome DevTools Memory 面板
6. **采用优化模式**：对象池、WeakMap、批量操作