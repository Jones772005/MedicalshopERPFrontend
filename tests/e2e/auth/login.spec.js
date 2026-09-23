import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Login page loads with required fields', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Valid Administrator login works', async ({ page }) => {
    await loginAs(page, 'administrator');
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Check if localStorage has tokens
    const token = await page.evaluate(() => localStorage.getItem('erp_token'));
    expect(token).toBeTruthy();
  });

  test('Invalid password is rejected', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@medishop.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Expect error message
    await expect(page.getByText('Invalid email or password')).toBeVisible();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Empty form is rejected', async ({ page }) => {
    // Clear default values
    await page.fill('input[type="email"]', '');
    await page.fill('input[type="password"]', '');
    await page.click('button[type="submit"]');
    
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
  });

  test('Logout works', async ({ page }) => {
    await loginAs(page, 'administrator');
    
    // Click profile dropdown and logout
    await page.click('header button:has(svg.lucide-user)'); // Profile button
    await page.click('button:has-text("Logout")');
    
    await expect(page).toHaveURL(/.*\/login/);
    
    const token = await page.evaluate(() => localStorage.getItem('erp_token'));
    expect(token).toBeNull();
  });

  test('Protected route without auth redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
