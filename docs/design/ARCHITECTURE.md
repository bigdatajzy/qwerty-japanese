# 日语打字练习网站 - 架构设计

## 1. 技术栈选择

### 1.1 核心技术

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Vue 3 | ^3.4 | Composition API |
| 构建工具 | Vite | ^5.0 | 快速开发体验 |
| 语言 | TypeScript | ^5.3 | 类型安全 |
| 路由 | Vue Router | ^4.2 | 页面路由 |
| 状态管理 | Pinia | ^2.1 | 轻量级状态管理 |
| 样式 | Tailwind CSS | ^3.4 | 原子化 CSS |
| HTTP | Axios | ^1.6 | 网络请求 |

### 1.2 开发工具

| 类别 | 工具 | 版本 | 说明 |
|------|------|------|------|
| 代码规范 | ESLint | ^8.56 | 代码检查 |
| 代码格式化 | Prettier | ^3.2 | 代码格式化 |
| Git Hooks | Husky | ^8.0 | Git 钩子 |
| 提交规范 | Commitlint | ^18.0 | 提交信息规范 |
| 自动修复 | lint-staged | ^15.0 | 暂存区检查 |

### 1.3 可选依赖

| 类别 | 工具 | 版本 | 说明 |
|------|------|------|------|
| 动画 | VueUse/Motion | ^10.0 | 动画库 |
| 图标 | Iconify | ^4.0 | 图标集合 |
| 测试 | Vitest | ^1.2 | 单元测试 |
| E2E 测试 | Playwright | ^1.40 | 端到端测试 |

---

## 2. 项目结构

```
qwerty-japanese/
├── .github/                    # GitHub 配置
│   └── workflows/              # GitHub Actions
├── public/                     # 静态资源
│   ├── favicon.ico
│   └── sounds/                 # 音效文件
│       ├── correct.mp3
│       └── error.mp3
├── src/
│   ├── assets/                # 资源文件
│   │   ├── fonts/             # 字体文件
│   │   └── images/            # 图片资源
│   ├── components/             # 公共组件
│   │   ├── common/            # 通用组件
│   │   │   ├── Button.vue
│   │   │   ├── Card.vue
│   │   │   └── Modal.vue
│   │   ├── typing/            # 打字相关组件
│   │   │   ├── KanaDisplay.vue    # 假名显示
│   │   │   ├── InputBox.vue       # 输入框
│   │   │   ├── ProgressBar.vue   # 进度条
│   │   │   ├── StatsPanel.vue     # 统计面板
│   │   │   └── KeyboardHint.vue  # 键盘指引
│   │   └── layout/            # 布局组件
│   │       ├── Header.vue
│   │       └── Footer.vue
│   ├── composables/           # 组合式函数
│   │   ├── useTyping.ts       # 打字逻辑
│   │   ├── useStats.ts        # 统计计算
│   │   ├── useSound.ts        # 音效播放
│   │   └── useTheme.ts        # 主题切换
│   ├── stores/                # Pinia 状态管理
│   │   ├── typing.ts          # 练习状态
│   │   ├── settings.ts        # 用户设置
│   │   └── stats.ts           # 统计数据
│   ├── router/                # 路由配置
│   │   └── index.ts
│   ├── types/                 # TypeScript 类型
│   │   ├── dict.ts            # 词库类型
│   │   ├── typing.ts          # 打字类型
│   │   └── user.ts            # 用户类型
│   ├── utils/                  # 工具函数
│   │   ├── romaji.ts          # 罗马字转换
│   │   ├── storage.ts         # 本地存储
│   │   └── logger.ts          # 日志工具
│   ├── data/                  # 静态数据
│   │   └── dicts/             # 词库数据
│   │       ├── hiragana.ts
│   │       ├── katakana.ts
│   │       └── jlpt.ts
│   ├── views/                 # 页面视图
│   │   ├── HomeView.vue       # 首页
│   │   ├── DictView.vue       # 词库选择
│   │   ├── PracticeView.vue   # 练习页面
│   │   └── ResultView.vue     # 结果页面
│   ├── App.vue                # 根组件
│   ├── main.ts                # 入口文件
│   └── env.d.ts               # 环境变量类型
├── .editorconfig              # 编辑器配置
├── .eslintrc.cjs              # ESLint 配置
├── .prettierrc                # Prettier 配置
├── .gitignore                  # Git 忽略文件
├── index.html                  # HTML 入口
├── package.json                # 项目配置
├── tsconfig.json               # TS 配置
├── tsconfig.node.json          # TS Node 配置
├── vite.config.ts              # Vite 配置
└── README.md                   # 项目说明
```

---

## 3. 构建配置

### 3.1 Vite 配置

```typescript
// vite.config.ts 主要配置
{
  // 项目根目录
  root: '.',
  
  // 构建输出
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    chunkSizeWarningLimit: 500,
  },
  
  // 开发服务器
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  
  // 插件
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
    }),
    Components({
      resolvers: [Icons()],
    }),
  ],
}
```

### 3.2 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| VITE_APP_TITLE | 应用标题 | 日语打字练习 |
| VITE_APP_VERSION | 版本号 | 1.0.0 |
| VITE_API_BASE | API 基础路径 | /api |
| VITE_ENABLE_LOGGER | 开启日志 | true |

---

## 4. 代码风格

### 4.1 命名规范

| 类型 | 规则 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | KanaDisplay.vue |
| 组合式函数 | camelCase (use前缀) | useTyping.ts |
| 类型/接口 | PascalCase | TypingState |
| 常量 | UPPER_SNAKE_CASE | MAX_WORD_LENGTH |
| CSS 类名 | kebab-case | .kana-card |

### 4.2 Vue 组件规范

```vue
<script setup lang="ts">
// 1. 类型导入
import type { PropType } from 'vue'
import { ref, computed, onMounted } from 'vue'

// 2. 类型定义
interface Props {
  kana: string
  showRomaji?: boolean
}

// 3. Props 定义
const props = withDefaults(defineProps<Props>(), {
  showRomaji: true,
})

// 4. Emits 定义
const emit = defineEmits<{
  (e: 'correct'): void
  (e: 'error', value: string): void
}>()

// 5. Refs
const inputRef = ref<HTMLInputElement | null>(null)

// 6. Computed
const displayKana = computed(() => props.kana)

// 7. Methods
function handleInput() {
  // ...
}

// 8. Lifecycle
onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <div class="kana-card">
    <span class="kana">{{ displayKana }}</span>
  </div>
</template>

<style scoped lang="scss">
.kana-card {
  @apply flex items-center justify-center;
}
</style>
```

### 4.3 目录导入顺序

```typescript
// 1. Vue 核心
import { ref, computed } from 'vue'
import type { WritableComputedRef } from 'vue'

// 2. Vue 生态
import { useRouter } from 'vue-router'
import { useStore } from 'pinia'

// 3. 组件
import KanaCard from '@/components/typing/KanaCard.vue'

// 4. 组合式函数
import { useTyping } from '@/composables/useTyping'

// 5. 工具函数
import { romajiToKana } from '@/utils/romaji'

// 6. 类型
import type { KanaWord } from '@/types/dict'

// 7. 常量
import { KANA_LIST } from '@/data/constants'
```

---

## 5. 调试配置

### 5.1 浏览器调试

```typescript
// vite.config.ts 添加
{
  server: {
    hmr: {
      overlay: true, // 显示错误覆盖层
    },
  },
}
```

### 5.2 VS Code 调试配置

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Vite Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Vite Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

### 5.3 Vue Devtools

- 安装 Vue Devtools 浏览器扩展
- 启用 Source Maps 支持断点调试

---

## 6. 日志规范

### 6.1 日志级别

| 级别 | 值 | 使用场景 |
|------|------|----------|
| ERROR | 0 | 错误信息 |
| WARN | 1 | 警告信息 |
| INFO | 2 | 一般信息 |
| DEBUG | 3 | 调试信息 |
| VERBOSE | 4 | 详细信息 |

### 6.2 日志格式

```
[2026-03-01 12:34:56.789] [INFO] [TypingPractice] 用户开始练习: { dictId: 'hiragana-basic', mode: 'random' }
[2026-03-01 12:35:01.234] [DEBUG] [InputHandler] 输入处理: { input: 'a', expected: 'あ', correct: true }
[2026-03-01 12:35:05.567] [ERROR] [SoundPlayer] 音效加载失败: { sound: 'error.mp3', error: 'File not found' }
```

### 6.3 日志工具实现

```typescript
// src/utils/logger.ts
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  VERBOSE = 4,
}

interface LogContext {
  timestamp: string
  level: string
  module: string
  message: string
  data?: Record<string, unknown>
}

class Logger {
  private module: string
  private level: LogLevel

  constructor(module: string, level: LogLevel = LogLevel.INFO) {
    this.module = module
    this.level = level
  }

  private format(level: string, message: string, data?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString()
    const log: LogContext = {
      timestamp,
      level,
      module: this.module,
      message,
      ...(data && { data }),
    }
    return JSON.stringify(log)
  }

  info(message: string, data?: Record<string, unknown>) {
    if (this.level >= LogLevel.INFO) {
      console.log(this.format('INFO', message, data))
    }
  }

  error(message: string, data?: Record<string, unknown>) {
    if (this.level >= LogLevel.ERROR) {
      console.error(this.format('ERROR', message, data))
    }
  }

  debug(message: string, data?: Record<string, unknown>) {
    if (this.level >= LogLevel.DEBUG) {
      console.debug(this.format('DEBUG', message, data))
    }
  }
}

export const createLogger = (module: string) => new Logger(module)
export { LogLevel }
```

### 6.4 生产环境日志

- 生产环境关闭 console 输出
- 使用 Sentry / LogRocket 等错误追踪工具
- 收集关键错误和性能数据

---

## 7. Git 工作流

### 7.1 分支策略

```
main (生产分支)
  ↑
develop (开发分支)
  ↑
feature/xxx (功能分支)
  ↑
fix/xxx (修复分支)
```

### 7.2 提交规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型：**

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug 修复 |
| docs | 文档更新 |
| style | 代码格式 |
| refactor | 重构 |
| test | 测试 |
| chore | 构建/工具 |

**示例：**

```
feat(typing): 添加假名显示组件

- 实现平假名和片假名显示
- 添加正确/错误状态样式
- 支持自定义颜色

Closes #12
```

### 7.3 Git Hooks

- `pre-commit`: 运行 lint-staged
- `commit-msg`: 检查提交信息格式

---

## 8. 部署配置

### 8.1 构建目标

- **平台**: Vercel / Netlify / Cloudflare Pages
- **Node 版本**: 18+
- **构建命令**: `npm run build`
- **输出目录**: `dist`

### 8.2 部署配置

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vue",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 9. 性能目标

| 指标 | 目标值 |
|------|--------|
| 首屏加载 | < 1.5s |
| 交互响应 | < 100ms |
| Lighthouse 分数 | > 90 |
| Bundle 大小 | < 200KB |

---

**文档版本**：1.0
**创建日期**：2026-03-01
