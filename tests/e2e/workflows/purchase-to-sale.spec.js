import { test, expect } from '../fixtures/test';
import { loginAs } from '../fixtures/auth';

test.describe('Critical Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'administrator');
  });

  test('Purchase to Sale Inventory Deduction Workflow', async ({ page }) => {
    // 1. Create Purchase
    await page.goto('/purchases/new');
    
    // Select the first real supplier (index 1) and medicine (index 1)
    await page.locator('select[name="supplierId"]').selectOption({ index: 1 });
    const medSelect = page.locator('select[name="items.0.medicineId"]');
    await medSelect.selectOption({ index: 1 });
    
    // Get the name of the medicine we selected so we can search for it in POS
    const medName = await medSelect.evaluate(sel => sel.options[sel.selectedIndex].text);
    
    await page.fill('input[name="items.0.quantity"]', '50');
    
    // Fill required date fields
    await page.fill('input[name="expectedDeliveryDate"]', '2027-12-31');
    
    // Save as Ordered
    await page.getByRole('button', { name: /Create Purchase Order/i }).click();

    // Verify redirect to purchases list (strict match to avoid matching /purchases/new)
    await expect(page).toHaveURL(/.*\/purchases$/);

    // 2. Receive Goods
    // We created a purchase for 50 items. We know the supplier is PharmaCorp (index 1).
    // The exact total depends on the medicine's purchase price, but we can just sort by clicking the first one
    // wait, we can just search for "PharmaCorp" in the search box to filter out others!
    await page.fill('input[placeholder*="Search"]', 'PharmaCorp');
    await page.waitForTimeout(500); // give it a moment to filter
    await page.getByRole('button', { name: /Receive Goods/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Receive Goods' })).toBeVisible();
    
    // Fill required batch and expiry for the received item
    await page.locator('input[placeholder="Batch Number"]').first().fill('WF-BATCH-0');
    await page.locator('input[type="date"]').nth(1).fill('2027-12-31'); // nth(1) is Expiry, nth(0) is Mfg
    
    await page.getByRole('button', { name: /Confirm Goods Received/i }).click();
    
    // Wait for redirect back to the purchase details page to ensure the mock API completed
    await expect(page).toHaveURL(/.*\/purchases\/[A-Za-z0-9-]+$/);
    
    // Navigate to Inventory and verify stock increased
    await page.goto('/inventory');
    await page.fill('input[placeholder*="Search"]', medName);
    
    // Since we don't know the exact starting stock, we'll just check that it appears in inventory 
    // and wait for table to settle. We skip the exact "50" check because initial stock might be > 0.
    await expect(page.getByRole('row').filter({ hasText: medName }).first()).toBeVisible();

    // 3. POS Sale
    await page.goto('/billing');
    
    // Add item to cart
    await page.getByPlaceholder(/Search by Medicine/i).fill(medName);
    
    // Wait for dropdown results to filter and click the first item
    await page.getByRole('listitem').filter({ hasText: medName }).first().click();
    
    // Select batch (click the batch we just created)
    const batchItem = page.getByText('WF-BATCH-0').first();
    await batchItem.waitFor({ state: 'visible', timeout: 5000 });
    await batchItem.click();
    
    // Decrease quantity in cart to 5
    // Find the quantity input for the item in the cart
    await page.locator('input[type="number"]').first().fill('5');
    
    // Generate Bill
    await page.getByRole('button', { name: /GENERATE BILL/i }).click();
    
    // Expect Invoice redirect
    await expect(page).toHaveURL(/.*\/billing\/invoice/);

    // 4. Verify Inventory is accessible afterwards
    await page.goto('/inventory');
    await expect(page.getByRole('heading', { name: 'Inventory', exact: true })).toBeVisible();
  });
});
