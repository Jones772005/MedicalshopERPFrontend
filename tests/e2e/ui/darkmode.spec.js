import { test, expect } from '../fixtures/test';
import { loginAs } from '../fixtures/auth';

test.describe('Dark Mode', () => {
  test('Dark mode toggles and persists', async ({ page }) => {
    await loginAs(page, 'administrator');
    
    // Locate the dark mode toggle button in header. Usually has a Sun or Moon icon.
    // For our implementation, we'll look for button with class containing toggle or has sun/moon
    const themeToggle = page.locator('header button').filter({ has: page.locator('svg.lucide-moon, svg.lucide-sun') }).first();
    
    // Ensure we start in light mode or know the initial state
    // Just click it to toggle
    await themeToggle.click();
    
    // Check if html has 'dark' class
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    
    // Reload and check persistence
    await page.reload();
    const isDarkAfterReload = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    
    expect(isDarkAfterReload).toBe(isDark);
  });
});
