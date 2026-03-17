# Qwerty Japanese - 日语打字练习

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?style=flat&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=flat&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

为日语学习者提供的打字练习工具，通过键盘输入罗马字转换为假名/汉字，锻炼肌肉记忆。

## ✨ 特性

- **假名练习**：平假名、片假名、浊音、半浊音、拗音
- **词汇练习**：JLPT N5-N4 词汇（规划中）
- **文章练习**：预制文章 + 自定义上传
- **日式键盘支持**：美式/日式键盘切换，按键高亮
- **注音支持**：汉字自动显示假名读音（Ruby）
- **多模式**：顺序模式、随机模式
- **统计**：WPM、正确率、速度曲线
- **暗色主题**：支持深色/浅色模式

## 🖥️ 在线体验

**生产环境**：https://bigdatajzy.github.io/qwerty-japanese/

**开发环境**：
```bash
npm run dev
```
访问 http://localhost:5173

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/bigdatajzy/qwerty-japanese.git
cd qwerty-japanese

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📁 项目结构

```
qwerty-japanese/
├── public/
│   └── articles/              # 预制文章 JSON
├── src/
│   ├── api/                   # API 接口
│   ├── components/            # 组件
│   │   ├── keyboard/          # 键盘组件
│   │   └── typing/           # 打字相关组件
│   ├── data/dicts/           # 词库数据
│   ├── router/               # 路由配置
│   ├── stores/               # Pinia 状态管理
│   ├── styles/               # 全局样式
│   ├── types/                # TypeScript 类型
│   ├── utils/                # 工具函数
│   └── views/                # 页面视图
├── docs/                      # 项目文档
│   ├── design/               # 设计文档
│   ├── implementation/       # 实现文档
│   └── requirements/         # 需求文档
└── .github/workflows/        # GitHub Actions
```

## 📖 文档

- [产品需求文档 (PRD)](docs/requirements/PRD.md)
- [架构设计](docs/design/ARCHITECTURE.md)
- [UI 设计规范](docs/design/UI_SPEC.md)
- [文章练习设计](docs/design/ARTICLE_PRACTICE.md)

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API) |
| 构建工具 | Vite 7 |
| 语言 | TypeScript 5.9 |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia 3 |
| 样式 | Tailwind CSS 4 |
| 部署 | GitHub Pages |

## 📝 词库

### 已实现
- 平假名（50 音图 + 浊音 + 半浊音 + 拗音）
- 片假名（50 音图 + 浊音 + 半浊音 + 拗音）

### 规划中
- [ ] JLPT N5 词汇
- [ ] JLPT N4 词汇
- [ ] JLPT N3 词汇
- [ ] 常用汉字

## 🎯 练习模式

| 模式 | 描述 | 状态 |
|------|------|------|
| 顺序模式 | 按词库顺序依次练习 | ✅ |
| 随机模式 | 随机抽取词库内容 | ✅ |
| 盲打模式 | 不显示罗马字提示 | ⏳ |
| 听写模式 | 播放发音，输入对应假名 | ⏳ |

## 📊 统计功能

- ✅ WPM（每分钟字数）
- ✅ 正确率
- ⏳ 速度曲线
- ⏳ 历史记录

## 🔄 更新日志

### 2026-03-16
- 添加文章练习模块
- 添加日式键盘支持
- 添加 Ruby 注音组件
- 添加暗色主题支持
- 优化 UI 视觉效果

### 2026-03-01
- 项目初始化
- 基础假名练习功能

## � License

MIT License

---

**项目维护**：[@bigdatajzy](https://github.com/bigdatajzy)
