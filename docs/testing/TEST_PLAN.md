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
- [ ] 顺序模式
- [ ] 随机模式

### 1.3 UI/UX 测试
- [ ] 响应式布局
- [ ] 暗色/浅色主题切换
- [ ] 键盘组件显示

---

## 2. 测试环境

- **开发服务器**: https://mac.tail1ddca4.ts.net:5173
- **测试框架**: Playwright
- **浏览器**: Chromium

---

## 3. 测试用例文件

| 文件 | 描述 |
|------|------|
| `home.spec.ts` | 首页测试 |
| `practice.spec.ts` | 打字练习功能测试 |
| `navigation.spec.ts` | 路由导航测试 |

---

## 4. 运行测试

```bash
# 安装浏览器
npx playwright install chromium

# 运行测试
npx playwright test

# 运行特定文件
npx playwright test tests/e2e/home.spec.ts
```
