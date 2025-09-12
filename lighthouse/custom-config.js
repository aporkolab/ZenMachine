/**
 * Custom Lighthouse configuration for ZenMachine
 * This script runs before Lighthouse audits to set up the application
 */

module.exports = async (browser, context) => {
  const page = await browser.newPage();
  
  // Set viewport for consistent testing
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Navigate to the application
  await page.goto(context.url, { waitUntil: 'networkidle0' });
  
  // Wait for Angular to bootstrap
  await page.waitForSelector('app-root', { timeout: 10000 });
  
  // Enable audio if the button exists (simulate user interaction)
  try {
    const enableAudioBtn = await page.$('button[data-test="enable-audio"]');
    if (enableAudioBtn) {
      await enableAudioBtn.click();
      await page.waitForTimeout(1000); // Wait for audio context to initialize
    }
  } catch (error) {
    console.log('Enable audio button not found or not clickable:', error.message);
  }
  
  // Add some test data if needed
  try {
    // Select a sound if available
    const soundSelect = await page.$('mat-select');
    if (soundSelect) {
      await soundSelect.click();
      await page.waitForTimeout(500);
      
      const option = await page.$('mat-option');
      if (option) {
        await option.click();
        await page.waitForTimeout(500);
      }
    }
  } catch (error) {
    console.log('Could not interact with sound selection:', error.message);
  }
  
  // Wait for any pending operations
  await page.waitForTimeout(2000);
  
  await page.close();
};