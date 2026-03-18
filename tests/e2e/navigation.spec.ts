import { test, expect } from '@playwright/test';

test.describe('导航测试', () => {
  test('首页导航到文章页', async ({ page }) => {
    await page.goto('/');
    await page.locator('text=文章练习').click();
    await expect(page).toHaveURL(/\/articles/);
    await expect(page.locator('h1:has-text("文章练习")')).toBeVisible();
  });

  test('首页导航到历史记录页', async ({ page }) => {
    await page.goto('/');
    await page.locator('text=历史记录').click();
    await expect(page).toHaveURL(/\/history/);
    await expect(page.locator('h1:has-text("练习历史")')).toBeVisible();
  });

  test('词库页面导航', async ({ page }) => {
    await page.goto('/#/dict');
    await expect(page.locator('text=词库')).toBeVisible();
  });

  test('URL 路由应该正常工作', async ({ page }) => {
    await page.goto('/#/articles');
    await expect(page).toHaveURL(/\/articles/);
    
    await page.goto('/#/history');
    await expect(page).toHaveURL(/\/history/);
  });
});
