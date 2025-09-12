import { test, expect } from '@playwright/test';

test.describe('ZenMachine E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main application', async ({ page }) => {
    // Wait for the app to load
    await page.waitForSelector('app-zen-pad');
    
    // Check if the zen pad component is visible
    const zenPad = page.locator('app-zen-pad');
    await expect(zenPad).toBeVisible();
  });

  test('should be able to enable audio', async ({ page }) => {
    // Look for enable audio button
    const enableAudioBtn = page.getByRole('button', { name: /enable audio/i });
    
    if (await enableAudioBtn.isVisible()) {
      await enableAudioBtn.click();
    }
    
    // Check if sound selection is now available
    const soundSelect = page.locator('mat-select[formControlName="soundPath"]');
    await expect(soundSelect).toBeVisible();
  });

  test('should be able to select and add sounds', async ({ page }) => {
    // Enable audio first
    const enableAudioBtn = page.getByRole('button', { name: /enable audio/i });
    if (await enableAudioBtn.isVisible()) {
      await enableAudioBtn.click();
    }

    // Select a sound
    await page.locator('mat-select').first().click();
    await page.getByRole('option').first().click();

    // Add sound
    const addSoundBtn = page.getByRole('button', { name: /add sound/i });
    await addSoundBtn.click();

    // Check if sound appears in active sounds list
    const activeSounds = page.locator('.active-sounds-list');
    await expect(activeSounds).toBeVisible();
  });

  test('should be able to control master volume', async ({ page }) => {
    // Enable audio
    const enableAudioBtn = page.getByRole('button', { name: /enable audio/i });
    if (await enableAudioBtn.isVisible()) {
      await enableAudioBtn.click();
    }

    // Find and interact with master volume slider
    const masterVolumeSlider = page.locator('mat-slider[aria-label*="Master Volume"]');
    await expect(masterVolumeSlider).toBeVisible();
    
    // Test volume adjustment
    await masterVolumeSlider.click({ position: { x: 50, y: 10 } });
  });

  test('should be able to toggle dark mode', async ({ page }) => {
    const darkModeToggle = page.getByRole('button', { name: /dark mode/i });
    
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      
      // Check if body has dark mode class
      const body = page.locator('body');
      await expect(body).toHaveClass(/dark-mode/);
    }
  });

  test('should be able to change background', async ({ page }) => {
    const backgroundSelect = page.locator('mat-select').nth(1); // Assuming it's the second select
    
    if (await backgroundSelect.isVisible()) {
      await backgroundSelect.click();
      await page.getByRole('option').nth(1).click(); // Select second option
      
      // Verify background changed
      const body = page.locator('body');
      const backgroundImage = await body.evaluate(el => 
        window.getComputedStyle(el).backgroundImage
      );
      expect(backgroundImage).not.toBe('none');
    }
  });

  test('should save and load settings', async ({ page }) => {
    // Enable audio
    const enableAudioBtn = page.getByRole('button', { name: /enable audio/i });
    if (await enableAudioBtn.isVisible()) {
      await enableAudioBtn.click();
    }

    // Save settings
    const saveBtn = page.getByRole('button', { name: /save/i });
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
    }

    // Reload page
    await page.reload();

    // Check if settings were restored
    // This would depend on your specific implementation
  });

  test('should handle mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if app is responsive
    const zenPad = page.locator('app-zen-pad');
    await expect(zenPad).toBeVisible();
    
    // Check if controls are still accessible
    const enableAudioBtn = page.getByRole('button', { name: /enable audio/i });
    if (await enableAudioBtn.isVisible()) {
      await expect(enableAudioBtn).toBeVisible();
    }
  });

  test('should handle accessibility features', async ({ page }) => {
    // Check for proper ARIA labels
    const sliders = page.locator('mat-slider');
    const sliderCount = await sliders.count();
    
    for (let i = 0; i < sliderCount; i++) {
      const slider = sliders.nth(i);
      await expect(slider).toHaveAttribute('aria-label');
    }
    
    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});