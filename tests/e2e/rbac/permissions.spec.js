import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';

test.describe('RBAC Route Protection \u0026 UI Visibility', () => {
  test('Cashier has restricted navigation and 403 on protected routes', async ({ page }) => {
    await loginAs(page, 'cashier');
    
    // UI Visibility: Cashier should not see Staff or Settings in Sidebar
    const sidebar = page.locator('nav');
    await expect(sidebar.getByText('Access Control')).not.toBeVisible();
    await expect(sidebar.getByText('Settings')).not.toBeVisible();
    await expect(sidebar.getByText('Sales \u0026 Billing')).toBeVisible(); // Allowed

    // Direct Navigation Protection:
    await page.goto('/roles');
    await expect(page.getByText('403 Access Denied')).toBeVisible();

    await page.goto('/audit-logs');
    await expect(page.getByText('403 Access Denied')).toBeVisible();

    await page.goto('/settings/security');
    await expect(page.getByText('403 Access Denied')).toBeVisible();
  });

  test('Pharmacist cannot access settings', async ({ page }) => {
    await loginAs(page, 'pharmacist');
    await page.goto('/settings');
    await expect(page.getByText('403 Access Denied')).toBeVisible();
  });

  test('Accountant can access Reports but not Medicines', async ({ page }) => {
    await loginAs(page, 'accountant');
    
    // Verify direct navigation protection
    await page.goto('/medicines');
    await expect(page.getByText('403 Access Denied')).toBeVisible();

    // Verify allowed navigation
    await page.goto('/reports');
    await expect(page.getByRole('heading', { name: 'Reports Dashboard', level: 1 })).toBeVisible();
  });
});
