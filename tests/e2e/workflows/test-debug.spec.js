import { test, expect } from '../fixtures/test';
import { loginAs } from '../fixtures/auth';

test.describe('Debug Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'administrator');
  });

  test('Dump table rows', async ({ page }) => {
    // 1. Create Purchase
    await page.goto('/purchases/new');
    
    await page.locator('select[name="supplierId"]').selectOption({ index: 1 });
    const medSelect = page.locator('select[name="items.0.medicineId"]');
    await medSelect.selectOption({ index: 1 });
    const medName = await medSelect.evaluate(sel => sel.options[sel.selectedIndex].text);
    const medId = await medSelect.evaluate(sel => sel.options[sel.selectedIndex].value);
    
    await page.fill('input[name="items.0.quantity"]', '50');
    await page.fill('input[name="expectedDeliveryDate"]', '2027-12-31');
    await page.getByRole('button', { name: /Create Purchase Order/i }).click();

    await expect(page).toHaveURL(/.*\/purchases$/);

    // DUMP TABLE ROWS
    // Wait for spinner to disappear
    await expect(page.locator('.animate-spin')).toHaveCount(0);
    
    // Dump all rows in the Purchases table
    const tableRows = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('tbody tr')).map(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length < 5) return null;
        return {
          poNumber: cols[0].innerText,
          supplier: cols[1].innerText,
          date: cols[2].innerText,
          amount: cols[3].innerText,
          status: cols[4].innerText,
          hasReceiveBtn: !!row.querySelector('button[title="Receive Goods"]')
        };
      }).filter(Boolean);
    });

    console.log('MED NAME:', medName, 'ID:', medId);
    console.log('TABLE ROWS:');
    console.table(tableRows);
  });
});
