# 技术方案 - 第一批需求实现

> 版本：1.0 | 日期：2026-03-17 | **状态：✅ 已完成**

---

## 1. 打字音效系统

### 1.1 技术选型
- **方案**：Web Audio API（无需额外音频文件）
- **合成音效**：使用 OscillatorNode 生成音效

### 1.2 音效类型

| 音效 | 频率 | 持续时间 | 用途 |
|------|------|----------|------|
| 正确音 | 800Hz → 1200Hz (上升) | 80ms | 输入正确 |
| 错误音 | 200Hz (低频) | 150ms | 输入错误 |
| 完成音 | 1000Hz × 3 连响 | 300ms | 练习完成 |

### 1.3 实现位置
- 新建 `src/composables/useSound.ts`
- 在现有 Settings store 中添加音效设置

### 1.4 配置项
```typescript
interface SoundSettings {
  enabled: boolean      // 总开关
  correctSound: boolean // 正确音效
  errorSound: boolean   // 错误音效
  completeSound: boolean // 完成音效
  volume: number        // 音量 0-100
}
```

---

## 2. 练习历史记录

### 2.1 技术选型
- **方案**：localStorage（50 条记录约 50KB，完全够用）
- **库**：使用已有 utils/logger.ts 的存储封装，或新建 storage.ts

### 2.2 数据结构

```typescript
interface HistoryRecord {
  id: string
  timestamp: number           // 时间戳
  date: string               // 格式化日期 "2026-03-17 11:30"
  
  // 练习信息
  dictId: string             // 词库 ID
  dictName: string           // 词库名称
  mode: 'order' | 'random'   // 练习模式
  
  // 统计
  totalChars: number          // 总字符数
  correctChars: number        // 正确字符数
  wrongChars: number          // 错误字符数
  accuracy: number           // 正确率 %
  wpm: number                // 每分钟字数
  duration: number           // 练习时长（秒）
  
  // 错误详情
  errors: Array<{
    expected: string         // 正确输入
    input: string           // 用户输入
    position: number        // 位置
  }>
}
```

### 2.3 API 设计
```typescript
// 保存记录
function addHistoryRecord(record: Omit<HistoryRecord, 'id'>): void

// 获取历史（倒序）
function getHistory(limit: number = 50): HistoryRecord[]

// 清除历史
function clearHistory(): void

// 导出 JSON
function exportHistory(): string
```

### 2.4 存储键
```
key: 'qwerty-japanese-history'
max: 50 条（超出删除最旧）
```

### 2.5 页面位置
- 新建 `src/views/HistoryView.vue`
- 在导航添加「历史记录」入口

---

## 3. 盲打训练模式

### 3.1 模式分级

| 等级 | 显示假名 | 显示罗马字 | 难度 |
|------|----------|------------|------|
| L1 显示 | ✅ | ✅ | 简单 |
| L2 隐藏假名 | ❌ | ✅ | 中等 |
| L3 完全隐藏 | ❌ | ❌ | 困难 |

### 3.2 实现位置
- 修改现有 `src/stores/typing.ts` 添加 blindMode
- 修改 `src/views/PracticeView.vue` 盲打显示逻辑
- 在设置面板添加盲打模式开关

### 3.3 配置项
```typescript
interface BlindModeSettings {
  enabled: boolean
  level: 1 | 2 | 3
  showNextRomaji: boolean  // L2/L3 时是否显示下一个的罗马字
}
```

---

## 4. 实施步骤

### Step 1: 音效系统
- [ ] 创建 `src/composables/useSound.ts`
- [ ] 在 Settings store 添加音效配置
- [ ] 在打字组件中集成音效

### Step 2: 历史记录
- [ ] 创建 `src/utils/storage.ts`
- [ ] 创建 `src/views/HistoryView.vue`
- [ ] 在练习完成后保存记录
- [ ] 添加路由和导航入口

### Step 3: 盲打模式
- [ ] 在 typing store 添加 blindMode
- [ ] 修改 PracticeView 显示逻辑
- [ ] 在设置面板添加盲打配置

### Step 4: 测试
- [ ] 音效功能测试
- [ ] 历史记录保存/展示测试
- [ ] 盲打三种模式测试

---

## 5. 预计工作量

| 功能 | 预估工时 |
|------|----------|
| 音效系统 | 1-2 小时 |
| 历史记录 | 2-3 小时 |
| 盲打模式 | 2-3 小时 |
| **总计** | **5-8 小时** |

---
