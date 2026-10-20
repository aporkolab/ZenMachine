import { test, expect } from '@playwright/test';

test.describe('ZenMachine E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('app-zen-pad')).toBeVisible();
  });

  test('should display the main application', async ({ page }) => {
    await expect(page.getByText('Sound Selection', { exact: true })).toBeVisible();
  });

  test('should be able to enable audio', async ({ page }) => {
    await page.getByRole('button', { name: 'Enable audio', exact: true }).click();
    await expect(page.locator('app-visualizer')).toBeVisible();
  });

  test('should be able to select, add and stop sounds', async ({ page }) => {
    await page.getByRole('button', { name: 'Enable audio', exact: true }).click();
    await page.getByRole('combobox', { name: 'Select a Sound' }).click();
    await page.getByRole('option', { name: 'Heavy Rain', exact: true }).click();
    await page.getByRole('button', { name: 'Add sound', exact: true }).click();
    await expect(page.locator('.active-sound')).toHaveCount(1);
    await page.getByRole('button', { name: 'Stop Heavy Rain' }).click();
    await expect(page.locator('.active-sound')).toHaveCount(0);
  });

  test('should be able to control master volume', async ({ page }) => {
    const slider = page.getByRole('slider', { name: 'Master Volume', exact: true });
    await slider.focus();
    await slider.press('Home');
    await slider.press('ArrowRight');
    await expect(slider).toHaveValue('0.01');
  });

  test('should be able to toggle dark mode', async ({ page }) => {
    const toggle = page.getByRole('switch', { name: 'Dark Mode' });
    await toggle.click();
    await expect(toggle).toBeChecked();
    await expect(page.locator('body')).toHaveClass(/dark-mode/);
    await toggle.click();
    await expect(toggle).not.toBeChecked();
    await expect(page.locator('body')).not.toHaveClass(/dark-mode/);
  });

  test('should be able to change background', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Background' }).click();
    await page.getByRole('option', { name: 'Forest', exact: true }).click();
    await expect(page.locator('body')).toHaveCSS('background-image', /forest\.jpg/);
  });

  test('should save and load settings', async ({ page }) => {
    const slider = page.getByRole('slider', { name: 'Master Volume', exact: true });
    await slider.focus();
    await slider.press('Home');
    await slider.press('ArrowRight');
    await page.getByRole('button', { name: 'Save Settings', exact: true }).click();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(slider).toHaveValue('0.01');
  });

  test('should handle mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('app-zen-pad')).toBeVisible();
    await page.getByRole('button', { name: 'Enable audio', exact: true }).click();
    await expect(page.locator('app-visualizer')).toBeVisible();
  });

  test('should expose names for every slider and allow keyboard navigation', async ({ page }) => {
    const sliders = page.getByRole('slider');
    expect(await sliders.count()).toBeGreaterThan(0);
    for (const slider of await sliders.all()) {
      await expect(slider).toHaveAccessibleName(/.+/);
    }
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });
});
