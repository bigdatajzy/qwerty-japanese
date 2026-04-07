# 测试计划 - Qwerty Japanese

## 1. 测试范围

### 1.1 核心功能测试
- [x] 首页加载与导航
- [x] 假名练习流程
- [x] 打字输入功能
- [x] 统计功能（WPM、正确率）
- [x] 词库切换
- [x] 页面路由

### 1.2 练习模式测试
- [x] 顺序模式（URL `?mode=order`，词表原始顺序）
- [x] 随机模式（URL `?mode=random` 或缺省）

### 1.3 UI/UX 测试
- [ ] 响应式布局
- [ ] 暗色/浅色主题切换
- [x] 键盘组件显示（练习页 ⌨️ 开关，依赖设置 `showKeyboard`）

---

## 2. 测试环境

- **默认本地开发地址**: `http://127.0.0.1:5173`（与 `playwright.config.ts` 一致）
- **可选覆盖**: 设置环境变量 `PLAYWRIGHT_BASE_URL`（例如 Tailscale HTTPS 地址）以在非本机场景运行 E2E
- **E2E 框架**: Playwright（Chromium）
- **单元测试**: Vitest（`happy-dom`），覆盖 `practiceWords`、`romaji` 等纯函数

---

## 3. 测试用例文件

| 文件 | 描述 |
|------|------|
| `tests/e2e/home.spec.ts` | 首页测试 |
| `tests/e2e/practice.spec.ts` | 打字练习（含顺序/随机、烟雾题集完成流） |
| `tests/e2e/navigation.spec.ts` | 路由导航测试 |
| `src/**/*.test.ts` | Vitest 单元测试 |

---

## 4. 运行测试

```bash
# 安装依赖后安装浏览器（首次）
npx playwright install chromium

# E2E（默认自动拉起 vite；CI 下需已安装依赖）
npm run test:e2e

# E2E UI 调试
npm run test:e2e:ui

# 单元测试
npm run test

# 单文件 E2E
npx playwright test tests/e2e/home.spec.ts
```
