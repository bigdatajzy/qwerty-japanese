import { test, expect } from '@playwright/test';

test.describe('从首页进入练习', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("平假名基础")').click();
    await expect(page).toHaveURL(/\/practice\//);
  });

  test('练习页面应该加载', async ({ page }) => {
    await expect(page.locator('input[type="text"]')).toBeVisible();
  });

  test('应该显示输入框', async ({ page }) => {
    const input = page.locator('input[type="text"]');
    await expect(input).toBeVisible();
  });

  test('应该可以输入罗马字', async ({ page }) => {
    const input = page.locator('input[type="text"]');
    await input.fill('a');
    await expect(input).toHaveValue(/^a?$/);
  });
});

test.describe('练习模式与直达路由', () => {
  test('随机模式答对后「正确」计数为 1', async ({ page }) => {
    await page.goto('/#/practice/hiragana-basic?mode=random');
    const input = page.locator('input[type="text"]');
    await expect(input).toBeVisible();
    const currentRomaji = await page.locator('div.text-center.mb-4 span.text-xl').first().innerText();
    await input.fill(currentRomaji.trim());
    await expect(input).toHaveValue('');
    const statsRow = page.locator('.flex.justify-center.gap-8');
    await expect(statsRow.locator('.text-3xl').nth(2)).toHaveText('1');
  });

  test('顺序模式首词为あ，答对后下一词为い', async ({ page }) => {
    await page.goto('/#/practice/hiragana-basic?mode=order');
    const input = page.locator('input[type="text"]');
    await expect(input).toBeVisible();
    await expect(page.locator('.text-6xl').first()).toHaveText('あ');
    await input.fill('a');
    await expect(input).toHaveValue('');
    await expect(page.locator('.text-6xl').first()).toHaveText('い');
  });

  test('顺序模式完成烟雾题集后进入结果页', async ({ page }) => {
    await page.goto('/#/practice/e2e-smoke?mode=order');
    const input = page.locator('input[type="text"]');
    await expect(input).toBeVisible();
    await input.fill('a');
    await expect(input).toHaveValue('');
    await input.fill('i');
    await expect(page).toHaveURL(/\/result/);
    await expect(page.getByRole('heading', { name: /练习完成/ })).toBeVisible();
  });
});
