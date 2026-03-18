import { test, expect } from '@playwright/test';

test.describe('首页测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('首页应该正常加载', async ({ page }) => {
    await expect(page).toHaveTitle(/qwerty-japanese/i);
    await expect(page.locator('text=日语打字练习')).toBeVisible();
  });

  test('应该显示练习入口卡片', async ({ page }) => {
    await expect(page.locator('text=假名单词')).toBeVisible();
    await expect(page.locator('text=文章练习')).toBeVisible();
    await expect(page.locator('text=历史记录')).toBeVisible();
  });

  test('应该显示词库分类', async ({ page }) => {
    await expect(page.locator('h3:has-text("平假名")')).toBeVisible();
    await expect(page.locator('h3:has-text("片假名")')).toBeVisible();
  });

  test('点击词库卡片应该跳转到练习页面', async ({ page }) => {
    // 点击第一个词库卡片
    await page.locator('button:has-text("平假名基础")').click();
    await expect(page).toHaveURL(/\/practice\//);
  });

  test('点击文章练习应该跳转到文章页面', async ({ page }) => {
    await page.locator('text=文章练习').click();
    await expect(page).toHaveURL(/\/articles/);
  });

  test('点击历史记录应该跳转到历史页面', async ({ page }) => {
    await page.locator('text=历史记录').click();
    await expect(page).toHaveURL(/\/history/);
  });
});
