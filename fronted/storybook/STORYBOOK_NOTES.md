# Storybook 学习与使用笔记

> 基于 `car-machine-effect` 项目实践整理

---

## 一、什么是 Storybook

Storybook 是一个**组件开发环境**，允许你在隔离的环境中开发、测试和展示 UI 组件，无需依赖完整的应用程序。

### 核心价值

- **组件驱动开发**：先开发组件，再集成到应用
- **可视化测试**：在浏览器中交互式地测试组件的各种状态
- **文档自动生成**：自动生成组件 API 文档
- **团队协作**：为设计师、产品、开发者提供统一的组件参考

---

## 二、安装与配置

### 2.1 安装依赖

```bash
npm install -D storybook @storybook/react @storybook/react-vite @storybook/addon-essentials
```

### 2.2 添加脚本

在 `package.json` 中添加：

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

### 2.3 项目结构

```
.
├── .storybook/
│   ├── main.ts        # 核心配置
│   └── preview.ts     # 预览配置
├── stories/
│   └── CarScreen.stories.tsx  # 组件故事文件
└── src/
    └── react/components/
        └── CarScreen.tsx      # 源组件
```

---

## 三、配置文件详解

### 3.1 main.ts - 核心配置

```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(tsx)'],  // 扫描路径
  addons: ['@storybook/addon-essentials'],       // 启用插件
  framework: '@storybook/react-vite',            // 使用 React + Vite
};

export default config;
```

| 字段 | 说明 |
|------|------|
| `stories` | 故事文件的 glob 模式 |
| `addons` | 启用的插件列表 |
| `framework` | 框架配置 |

### 3.2 preview.ts - 预览配置

```ts
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },  // 默认展开控件面板
  },
};

export default preview;
```

**常用参数**：

| 参数 | 说明 |
|------|------|
| `controls.expanded` | 默认展开控件面板 |
| `actions.argTypesRegex` | 自动捕获以 `on` 开头的事件 |
| `backgrounds` | 背景色预设 |
| `viewport` | 响应式视图预设 |

---

## 四、编写 Stories（CSF 格式）

### 4.1 CSF 是什么

**Component Story Format (CSF)** 是 Storybook 推荐的故事编写格式，使用标准的 ES Module 导出。

### 4.2 基本结构

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CarScreen } from '../src/react/components/CarScreen';

// 1. 定义元数据
const meta: Meta<typeof CarScreen> = {
  title: 'CarScreen',           // 导航标题
  component: CarScreen,         // 绑定组件
  argTypes: {                   // 控件配置
    model: { control: 'select', options: ['tesla-model-3', 'byd-seal'] },
    width: { control: { type: 'range', min: 320, max: 1200 } },
  },
};

export default meta;

// 2. 定义故事类型
type Story = StoryObj<typeof CarScreen>;

// 3. 编写故事
export const TeslaModel3: Story = {
  args: {
    model: 'tesla-model-3',
    layers: [...],
    width: 640,
  },
};
```

### 4.3 Meta 配置详解

| 属性 | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 在左侧导航中的路径，支持嵌套（如 `'Components/CarScreen'`） |
| `component` | `Component` | 要展示的组件 |
| `argTypes` | `ArgTypes` | 定义控件类型和默认值 |
| `parameters` | `Parameters` | 覆盖全局参数 |
| `tags` | `string[]` | 标签（如 `['autodocs']` 自动生成文档） |

---

## 五、Controls & ArgTypes

### 5.1 自动推断

Storybook 会根据组件的 TypeScript 类型自动推断控件：

```tsx
export interface CarScreenProps {
  model: string | CarTemplate;   // 自动推断为 text/select
  width?: number;                // 自动推断为 number
  theme?: 'dark' | 'light';      // 自动推断为 radio
}
```

### 5.2 手动配置

通过 `argTypes` 自定义控件：

```tsx
const meta: Meta<typeof CarScreen> = {
  component: CarScreen,
  argTypes: {
    // 下拉选择
    model: {
      control: 'select',
      options: ['byd-seal', 'nio-et5', 'xpeng-g9', 'li-l9', 'tesla-model-3'],
    },
    
    // 滑块
    width: {
      control: { type: 'range', min: 320, max: 1200, step: 10 },
    },
    
    // 单选按钮
    theme: {
      control: 'radio',
      options: ['dark', 'light'],
    },
    
    // 隐藏控件（不显示在面板中）
    onLayerError: { control: false },
  },
};
```

### 5.3 常用控件类型

| 类型 | 说明 | 使用场景 |
|------|------|---------|
| `text` | 文本输入 | string |
| `number` | 数字输入 | number |
| `range` | 滑块 | number（有范围限制） |
| `select` | 下拉选择 | 枚举值 |
| `radio` | 单选按钮 | 少量选项 |
| `boolean` | 复选框 | boolean |
| `color` | 颜色选择器 | color |
| `object` | JSON 编辑器 | 对象 |
| `array` | 数组编辑器 | 数组 |

---

## 六、Story 模式

### 6.1 Args 模式（推荐）

使用 `args` 属性传递 props，适合简单场景：

```tsx
export const TeslaModel3: Story = {
  args: {
    model: 'tesla-model-3',
    layers: sampleLayers,
    width: 640,
  },
};
```

### 6.2 Render 模式

使用 `render` 函数完全控制渲染，适合复杂场景：

```tsx
export const AllTemplates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      {['byd-seal', 'nio-et5', 'xpeng-g9', 'li-l9', 'tesla-model-3'].map((m) => (
        <CarScreen key={m} model={m} layers={sampleLayers} width={320} />
      ))}
    </div>
  ),
};
```

### 6.3 组合使用

```tsx
export const WithToolbar: Story = {
  args: {
    model: 'tesla-model-3',
    layers: sampleLayers,
    width: 640,
    showToolbar: true,
  },
  render: (args) => (
    <div style={{ background: '#1a1a2e', padding: 24 }}>
      <CarScreen {...args} />
    </div>
  ),
};
```

---

## 七、运行与构建

### 7.1 启动开发服务器

```bash
npm run storybook
```

默认访问地址：`http://localhost:6006`

### 7.2 构建静态站点

```bash
npm run build-storybook
```

输出目录：`storybook-static/`

### 7.3 预览界面布局

```
┌─────────────────────────────────────────────────────────────┐
│  Storybook 界面                                             │
├──────────────────┬──────────────────┬──────────────────────┤
│  左侧：故事列表   │  中间：组件预览   │  右侧：控制面板       │
│  - CarScreen     │                  │  - Controls（参数）  │
│    - TeslaModel3 │  实时渲染区域     │  - Actions（事件）   │
│    - BYDSeal     │  可交互操作       │  - Docs（文档）      │
│    - AllTemplates│                  │  - Background（背景）│
└──────────────────┴──────────────────┴──────────────────────┘
```

---

## 八、实战案例

### 8.1 完整示例

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CarScreen } from '../src/react/components/CarScreen';
import '../src/templates';

const meta: Meta<typeof CarScreen> = {
  title: 'CarScreen',
  component: CarScreen,
  argTypes: {
    model: {
      control: 'select',
      options: ['byd-seal', 'nio-et5', 'xpeng-g9', 'li-l9', 'tesla-model-3'],
    },
    width: { control: { type: 'range', min: 320, max: 1200, step: 10 } },
    theme: { control: 'radio', options: ['dark', 'light'] },
  },
};

export default meta;

type Story = StoryObj<typeof CarScreen>;

// 共享数据
const sampleLayers = [
  { src: 'https://placehold.co/1920x1080/1a1a2e/e94560?text=BG', zIndex: 0, alt: 'background' },
  { src: 'https://placehold.co/1920x1080/16213e/0f3460?text=Overlay', zIndex: 1, alt: 'overlay' },
];

// 基础故事
export const TeslaModel3: Story = {
  args: { model: 'tesla-model-3', layers: sampleLayers, width: 640 },
};

export const BYDSeal: Story = {
  args: { model: 'byd-seal', layers: sampleLayers, width: 640 },
};

// 自定义配置
export const NIOET5: Story = {
  args: {
    model: 'nio-et5',
    layers: [{ src: 'https://placehold.co/1728x1888/000000/ffffff?text=NIO', zIndex: 0, alt: 'nio' }],
    width: 400,
  },
};

// 多组件展示
export const AllTemplates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      {['byd-seal', 'nio-et5', 'xpeng-g9', 'li-l9', 'tesla-model-3'].map((m) => (
        <CarScreen key={m} model={m} layers={sampleLayers} width={320} />
      ))}
    </div>
  ),
};

// 错误状态测试
export const UnknownModel: Story = {
  args: { model: 'not-a-car', layers: [], width: 640 },
};

// 自定义模板
export const CustomTemplate: Story = {
  args: {
    model: {
      name: 'Custom 800x600',
      screenWidth: 800,
      screenHeight: 600,
      screenRadius: 4,
      accentColor: '#00ff00',
    },
    layers: [{ src: 'https://placehold.co/800x600/2d2d2d/ffffff?text=Custom', zIndex: 0, alt: 'custom' }],
    width: 480,
  },
};
```

### 8.2 测试场景覆盖

| 场景 | 目的 |
|------|------|
| `TeslaModel3` | 基础功能验证 |
| `BYDSeal` | 不同车型适配 |
| `NIOET5` | 特殊分辨率处理 |
| `AllTemplates` | 多组件并排对比 |
| `UnknownModel` | 错误边界测试 |
| `CustomTemplate` | 自定义模板能力 |

---

## 九、最佳实践

### 9.1 故事命名规范

- 使用 PascalCase 命名故事
- 故事名应描述组件状态或使用场景
- 避免使用技术术语作为故事名

### 9.2 组织故事文件

```
stories/
├── CarScreen.stories.tsx
├── LayerStack.stories.tsx
└── ScreenFrame.stories.tsx
```

### 9.3 共享数据

```tsx
// 在故事文件顶部定义共享数据
const sampleLayers = [...];
const defaultArgs = { width: 640, theme: 'dark' };

// 在故事中复用
export const Default: Story = {
  args: { ...defaultArgs, model: 'tesla-model-3' },
};
```

### 9.4 文档注释

```tsx
/**
 * 汽车屏幕预览组件
 * @param model - 车型模板
 * @param layers - 图片层列表
 * @param width - 预览宽度
 */
export interface CarScreenProps {
  model: string | CarTemplate;
  layers: Layer[];
  width?: number;
}
```

### 9.5 性能优化

- 避免在 render 函数中创建新对象
- 使用 `storySort` 自定义故事排序
- 对于大型组件，考虑使用 `loaders` 异步加载数据

---

## 十、常用插件

| 插件 | 功能 |
|------|------|
| `@storybook/addon-essentials` | 基础功能（Controls、Docs、Actions 等） |
| `@storybook/addon-a11y` | 无障碍检测 |
| `@storybook/addon-interactions` | 交互测试 |
| `@storybook/addon-links` | 故事间跳转 |
| `@storybook/addon-viewport` | 响应式视图 |

---

## 十一、快捷键

| 快捷键 | 功能 |
|--------|------|
| `s` | 搜索故事 |
| `o` | 切换侧边栏 |
| `p` | 切换面板 |
| `Esc` | 关闭弹窗 |
| `Ctrl + +` | 放大预览 |
| `Ctrl + -` | 缩小预览 |

---

## 十二、参考资料

- [Storybook 官方文档](https://storybook.js.org/docs/react/get-started/introduction)
- [CSF 规范](https://storybook.js.org/docs/react/api/csf)
- [Controls 文档](https://storybook.js.org/docs/react/essentials/controls)