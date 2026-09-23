import { test, expect } from '../fixtures/test';
import { loginAs } from '../fixtures/auth';

test.describe('Reports Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'administrator');
  });

  test('Reports pages load without errors', async ({ page }) => {
    const reportPages = [
      '/reports',
      '/reports/sales',
      '/reports/inventory',
      '/reports/financial',
      '/reports/tax'
    ];

    for (const url of reportPages) {
      await page.goto(url);
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    }
  });
});
