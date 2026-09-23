import { test, expect } from '../fixtures/test';
import { loginAs } from '../fixtures/auth';

test.describe('Customer Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'administrator');
  });

  test('Create a new customer and verify fields save correctly (BUG-008)', async ({ page }) => {
    await page.goto('/customers');
    await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();

    await page.getByRole('button', { name: 'Add Customer' }).click();

    // Fill in the form
    await page.locator('input[name="name"]').fill('Test E2E Customer');
    await page.locator('input[name="phoneNumber"]').fill('9998887776');
    await page.locator('input[name="email"]').fill('teste2e@example.com');
    await page.locator('textarea[name="address"]').fill('123 E2E Street').catch(() => page.locator('input[name="address"]').fill('123 E2E Street'));
    
    // Save
    await page.getByRole('button', { name: 'Save Customer' }).click();

    // Verify redirect to list and customer is present
    await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
    await expect(page.getByText('Test E2E Customer')).toBeVisible();
    await expect(page.getByText('9998887776')).toBeVisible();
  });
});
