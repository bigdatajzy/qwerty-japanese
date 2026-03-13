# 新需求：微软日式键盘支持

## 需求描述

支持使用微软标准的日式键盘（OADG 109A 布局）进行打字练习，显示可视化键盘布局，帮助用户熟悉日式键盘按键位置。

## 需求详情

### 1. 键盘布局支持

- **微软日式键盘 (Microsoft Japanese Keyboard / OADG 109A)**
- **美式键盘 (US QWERTY)** - 现有支持

### 2. 功能列表

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 键盘布局选择 | 用户可选择使用日式键盘或美式键盘 | P0 |
| 可视化键盘显示 | 在练习页面显示所选键盘的布局 | P0 |
| 按键高亮 | 实时显示当前需要输入的按键位置 | P0 |
| 按键按下反馈 | 按下按键时显示视觉反馈 | P1 |

### 3. 日式键盘布局特点

- 额外的假名键区域（平假名印刷）
- 変換 (Henkan) 键和无変換 (Muhenkan) 键
- Backslash (\) 键位置不同于美式键盘
- 全角/半角切换键

## 技术实现

### 键盘组件

```
src/components/keyboard/
├── Keyboard.vue          # 主键盘组件
├── JapaneseKeyboard.vue  # 日式键盘布局
├── USKeyboard.vue        # 美式键盘布局
└── Key.vue               # 单个按键组件
```

### 状态管理

在 settings store 中添加：
- `keyboardLayout`: 'us' | 'japanese'
- `showKeyboard`: boolean

---

**创建日期**：2026-03-13
**状态**：待开发
