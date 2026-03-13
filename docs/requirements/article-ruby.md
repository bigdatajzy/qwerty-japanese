# 功能设计：日语文章注音显示

## 需求概述

在文章练习时，在每个汉字/词汇上方显示小字号平假名注音（振假名），帮助学习者正确发音。

## 效果示意

```
    い   かく    せい    よう    じ   ↓ 假名在汉字上方
┌─────────────────────────────────────┐
│  日 本 語 を 勉 強 す る の は 楽 し い で す │
└─────────────────────────────────────┘
```

## 核心挑战

1. **注音生成**：需要将汉字转换为假名读音
2. **显示布局**：汉字与注音的对齐
3. **自定义文章格式**：需要支持注音数据

## 方案设计

### 方案 A：前端实时转换（推荐）

使用 JavaScript 库在浏览器端将汉字转换为假名：
- 优点：无需后端，自定义文章也能使用
- 缺点：准确率不是 100%

**推荐库**：
- `wakati-me` 或类似轻量库
- 或使用 Google IME Web API（需要网络）

### 方案 B：上传时指定注音

自定义文章格式支持手动添加注音：
- 优点：100% 准确
- 缺点：用户需要手动添加注音，工作量大

### 方案 C：纯文本 + 自动检测

用户上传纯文本，系统自动检测并添加注音：
- 优点：平衡体验
- 缺点：实现复杂

## 推荐方案：方案 B（扩展自定义格式）

### 新的自定义文章格式

**格式：带注音的 Markdown 风格**

```json
{
  "title": "标题",
  "content": [
    {
      "text": "日本語を勉強するのは楽しいです",
      "ruby": [
        {"word": "日本語", "kana": "にほんご"},
        {"word": "勉強", "kana": "べんきょう"},
        {"word": "楽しい", "kana": "たのしい"}
      ]
    },
    {
      "text": "毎日の練習が大切です",
      "ruby": [
        {"word": "毎日", "kana": "まいにち"},
        {"word": "練習", "kana": "れんしゅう"},
        {"word": "大切", "kana": "たいせつ"}
      ]
    }
  ]
}
```

**简化格式（自动生成注音）**：

```json
{
  "title": "标题",
  "content": "日本語を勉強するのは楽しいです。毎日の練習が大切です。",
  "autoRuby": true
}
```

当 `autoRuby: true` 时，前端自动将汉字转换为假名。

### 预制文章格式

预制文章同样支持两种格式：

1. **纯文本** - 前端自动添加注音
2. **带注音** - 精确控制每个词的注音

## 技术实现

### 1. 类型定义

```typescript
interface RubyWord {
  word: string      // 原词（汉字）
  kana: string      // 注音（假名）
}

interface ContentBlock {
  text: string      // 原始文本
  ruby?: RubyWord[] // 注音数组（可选）
}

interface Article {
  id: string
  title: string
  content: string | ContentBlock[]  // 支持纯文本或带注音的数组
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  source: 'preset' | 'custom'
  autoRuby?: boolean  // 是否自动生成注音
}
```

### 2. 前端注音库选择

**选项 1：Wakati-me（推荐）**
- 轻量级日语分词库
- 无需网络

**选项 2：Google IME API**
- 准确率高
- 需要网络

**选项 3：本地 JSON 词典**
- 最可靠
- 需要维护大词典文件

### 3. 组件设计

#### 3.1 RubyText 组件

```vue
<template>
  <span class="ruby-container">
    <span class="ruby-text">{{ kana }}</span>
    <span class="base-text">{{ word }}</span>
  </span>
</template>

<style>
.ruby-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
}
.ruby-text {
  font-size: 0.5em;  /* 小字号 */
  color: #6366f1;    /* 靛蓝色 */
}
.base-text {
  font-size: 1em;
}
</style>
```

#### 3.2 ArticleDisplay 组件

处理整篇文章的渲染：
- 解析文本
- 匹配注音
- 渲染 RubyText 组件

### 4. 数据流

```
用户输入 → 解析格式 → 检查 autoRuby → 
  ├─ true:  调用注音库转换
  └─ false: 使用手动注音
          ↓
    渲染组件 → 显示
```

## 文件修改清单

### 现有文件

| 文件 | 修改内容 |
|------|---------|
| `src/types/article.ts` | 添加 RubyWord, ContentBlock 类型 |
| `src/data/articles/index.ts` | 更新预制文章格式 |
| `src/views/ArticlePracticeView.vue` | 添加注音显示组件 |
| `src/views/ArticlesView.vue` | 更新上传格式说明 |

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/utils/ruby.ts` | 注音转换工具函数 |
| `src/components/RubyText.vue` | 注音文本组件 |

## 实现步骤

### Phase 1: 基础设施
1. 更新类型定义
2. 创建 RubyText.vue 组件
3. 创建 ruby.ts 工具（基础版）

### Phase 2: 练习界面
1. 更新 ArticlePracticeView.vue
2. 添加注音显示逻辑

### Phase 3: 自定义上传
1. 更新上传格式说明
2. 添加格式验证

### Phase 4: 预制文章
1. 转换预制文章格式（添加 ruby 数据）

## 待定事项

1. **注音库选择**：需要测试哪个库效果最好
2. **性能考虑**：长文章可能需要懒加载
3. **移动端适配**：小屏幕设备显示效果

---

**设计日期**：2026-03-13
**状态**：待审查
