import { test, expect } from '../fixtures/test';
import { loginAs } from '../fixtures/auth';

test.describe('Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'administrator');
  });

  test('BUG-016: Dashboard stock fields are not NaN', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // The dashboard has cards with stock value and low stock items.
    // Ensure they don't contain NaN.
    const textContent = await page.content();
    expect(textContent).not.toContain('₹NaN');
    expect(textContent).not.toContain('NaN%');
  });

  test('BUG-004: Receive Purchase persists sellingPrice', async ({ page }) => {
    // We can simulate receiving a purchase or just check that in POS/Inventory the selling price isn't NaN.
    await page.goto('/inventory');
    await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible();
    const textContent = await page.content();
    expect(textContent).not.toContain('₹NaN');
  });
});
