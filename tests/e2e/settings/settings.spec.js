import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';

test.describe('Settings \u0026 Audit', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'administrator');
  });

  test('Settings save to localStorage and persist across reload', async ({ page }) => {
    await page.goto('/settings/pharmacy');
    
    // Assume there is an input for Pharmacy Name
    await page.fill('input[name="pharmacyName"], input[name="name"]', 'QA Medishop Renewed');
    
    // Automatically accept the mock alert
    page.once('dialog', dialog => dialog.accept());
    
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Wait for the exact button text so we don't match "Saving..."
    await expect(page.getByRole('button', { name: 'Save Settings', exact: true }).first()).toBeVisible();
    // Also wait a tiny bit to ensure localStorage sync is fully flushed before reload
    await page.waitForTimeout(500);
    
    await page.reload();
    
    // Verify it persists
    await expect(page.locator('input[name="pharmacyName"], input[name="name"]')).toHaveValue('QA Medishop Renewed');
  });

  test('Audit log records actions', async ({ page }) => {
    await page.goto('/audit-logs');
    
    // We expect to see "LOGIN" in the audit log since we just logged in via fixture
    const table = page.getByRole('table');
    await expect(table).toContainText(/LOGIN/i);
  });
});
