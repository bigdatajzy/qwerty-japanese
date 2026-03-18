import { test, expect } from '@playwright/test';

test.describe('打字练习功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 通过首页点击进入练习
    await page.locator('button:has-text("平假名基础")').click();
  });

  test('练习页面应该加载', async ({ page }) => {
    await expect(page).toHaveURL(/\/practice\//);
  });

  test('应该显示输入框', async ({ page }) => {
    const input = page.locator('input[type="text"]');
    await expect(input).toBeVisible();
  });

  test('应该可以输入罗马字', async ({ page }) => {
    const input = page.locator('input[type="text"]');
    await input.fill('a');
    await expect(input).toHaveValue('a');
  });

  test('应该可以完成一个假名的练习', async ({ page }) => {
    const input = page.locator('input[type="text"]');
    await input.waitFor({ state: 'visible' });
    
    // 等待页面加载完成
    await page.waitForTimeout(1000);
    
    // 输入第一个假名对应的罗马字
    await input.fill('a');
    
    // 检查输入成功
    const value = await input.inputValue();
    expect(value).toBe('a');
  });
});
