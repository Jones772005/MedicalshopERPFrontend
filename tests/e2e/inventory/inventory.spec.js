import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';

test.describe('Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'administrator');
  });

  test('Inventory loads and displays stock values', async ({ page }) => {
    await page.goto('/inventory');
    await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('Low stock page loads', async ({ page }) => {
    await page.goto('/inventory/low-stock');
    await expect(page.getByRole('heading', { name: 'Low Stock' })).toBeVisible();
  });

  test('Expiry management page loads', async ({ page }) => {
    await page.goto('/inventory/expiry');
    await expect(page.getByRole('heading', { name: 'Expiry Management' })).toBeVisible();
  });
});
