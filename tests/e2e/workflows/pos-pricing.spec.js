import { test, expect } from '../fixtures/test';
import { loginAs } from '../fixtures/auth';

test.describe('POS Pricing Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'administrator');
  });

  test('POS uses sellingPrice instead of mrp', async ({ page }) => {
    // 1. Create a medicine with specific prices
    await page.goto('/medicines/add');
    await page.fill('input[name="name"]', 'QA Test Medicine 2');
    await page.fill('input[name="genericName"]', 'Test Generic');
    await page.fill('input[name="category"]', 'Testing');
    await page.fill('input[name="manufacturer"]', 'QA Manufacturer');
    
    // Pricing
    await page.fill('input[name="purchasePrice"]', '10');
    await page.fill('input[name="sellingPrice"]', '15');
    await page.fill('input[name="mrp"]', '20');
    await page.fill('input[name="gst"]', '5');
    
    // Inventory
    await page.fill('input[name="quantity"]', '10');
    await page.fill('input[name="minimumStockLevel"]', '5');
    await page.fill('input[name="maximumStockLevel"]', '50');
    await page.fill('input[name="supplierId"]', '1');
    
    // Dates & batch
    await page.fill('input[name="batchNumber"]', 'QA-POS-PRICE-001');
    await page.fill('input[name="manufacturingDate"]', '2024-01-01');
    await page.fill('input[name="expiryDate"]', '2027-01-01');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/medicines$/);

    // 2. Verify Inventory Batch Prices
    await page.getByRole('link', { name: 'Current Stock', exact: true }).click();
    await page.fill('input[placeholder*="Search inventory"]', 'QA Test Medicine 2');
    
    const row = page.getByRole('row').filter({ hasText: 'QA-POS-PRICE-001' });
    await expect(row).toBeVisible();
    
    // Purchase Price should be 10, Selling Price 15
    await expect(row).toContainText('10.00'); // Purchase Price
    await expect(row).toContainText('15.00'); // Selling Price
    
    // 3. Go to POS and add to cart
    await page.goto('/billing');
    
    await page.fill('input[placeholder*="Search by Medicine Name"]', 'QA Test Medicine 2');
    
    // Select the product from the search dropdown
    await page.getByText('QA Test Medicine 2').first().click();
    
    // Handle the batch selector modal if it appears (due to API race conditions)
    try {
      await page.getByText(/QA-POS-PRICE-001/i).first().click({ timeout: 2000 });
    } catch (e) {
      // It auto-added to the cart
    }

    // Verify POS Rate
    // The cart table should display the rate as 15.00, NOT 20.00
    const cartRow = page.getByRole('row').filter({ hasText: 'QA Test Medicine 2' });
    await expect(cartRow).toBeVisible();
    await expect(cartRow).toContainText('15.00'); // Rate
    await expect(cartRow).not.toContainText('20.00'); // Should not contain MRP in Rate/Amount
    
    // Verify Totals
    // Subtotal: 15.00
    // GST (5% of 15): 0.75
    // Grand Total: 15.75
    await expect(page.getByText(/₹15\.00/i).first()).toBeVisible();
    await expect(page.getByText(/₹0\.75/i)).toBeVisible();
    await expect(page.getByText(/₹15\.75/i).last()).toBeVisible();

    // 4. Complete Sale
    // Received amount is pre-filled with grand total, so no need to fill it manually,
    // but just to be safe, we can use the label if needed.
    await page.getByRole('button', { name: 'Generate Bill' }).click();

    // Verify Invoice displays the correct rate
    await expect(page.getByRole('heading', { name: 'Invoice' })).toBeVisible();
    
    // Invoice items table
    const invoiceRow = page.getByRole('row').filter({ hasText: 'QA Test Medicine 2' });
    await expect(invoiceRow).toContainText('15.00');
    await expect(invoiceRow).not.toContainText('20.00');
    
    // 5. Verify Inventory Deduction
    await page.getByRole('link', { name: 'Current Stock', exact: true }).click();
    await page.fill('input[placeholder*="Search inventory"]', 'QA Test Medicine 2');
    const invRow = page.getByRole('row').filter({ hasText: 'QA-POS-PRICE-001' });
    await expect(invRow).toBeVisible();
    await expect(invRow).toContainText('9'); // Quantity 10 -> 9
  });
});
