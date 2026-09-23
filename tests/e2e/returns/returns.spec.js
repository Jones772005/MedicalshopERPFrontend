import { test, expect } from '../fixtures/test';
import { loginAs } from '../fixtures/auth';

test.describe('Returns Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'administrator');
  });

  test('Sales Return page loads and functions', async ({ page }) => {
    await page.goto('/sales/returns');
    await expect(page.getByRole('heading', { name: 'Sales Returns' })).toBeVisible();

    // Open the return creation form
    await page.getByRole('button', { name: 'Create Return' }).click();

    // The form should show 'Load Invoice' button
    const loadBtn = page.getByRole('button', { name: 'Load Invoice' });
    await expect(loadBtn).toBeVisible();

    // Button disabled when no ID entered
    await expect(loadBtn).toBeDisabled();

    // Fill in a non-existent invoice via placeholder
    await page.getByPlaceholder(/e\.g\. INV-/i).fill('NONEXISTENT-999');
    await expect(loadBtn).toBeEnabled();
    await loadBtn.click();

    // Should show error message
    await expect(page.getByText(/not found/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('Purchase Return page loads and functions', async ({ page }) => {
    await page.goto('/purchases/returns');
    await expect(page.getByRole('heading', { name: 'Purchase Returns' })).toBeVisible();

    // Open the return creation form
    await page.getByRole('button', { name: 'Create Return' }).click();

    // The form should show 'Load Purchase' button
    const loadBtn = page.getByRole('button', { name: 'Load Purchase' });
    await expect(loadBtn).toBeVisible();

    // Button should be disabled when no ID entered
    await expect(loadBtn).toBeDisabled();

    // Fill in a non-existent ID via placeholder
    await page.getByPlaceholder(/numeric Purchase ID/i).fill('99999');
    await expect(loadBtn).toBeEnabled();
    await loadBtn.click();

    // Should show error
    await expect(page.getByText(/not found/i).first()).toBeVisible({ timeout: 10000 });
  });
});
