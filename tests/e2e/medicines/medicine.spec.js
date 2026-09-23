import { test, expect } from '../fixtures/test';
import { loginAs } from '../fixtures/auth';

test.describe('Medicine Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'administrator');
    await page.goto('/medicines');
  });

  test('Medicine page loads and search works', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Medicines' })).toBeVisible();
    
    // Test search
    await page.fill('input[placeholder*="Search"]', 'Paracetamol');
    // Assuming the table renders a matching row
    await expect(page.getByRole('table')).toContainText('Paracetamol');
  });

  test('Add medicine validation and creation', async ({ page }) => {
    await page.goto('/medicines/add');
    
    // Trigger validation by submitting empty
    await page.click('button[type="submit"]');
    await expect(page.getByText(/Medicine name is required/i).first()).toBeVisible();
    
    // Fill form
    await page.fill('input[name="name"]', 'QA Paracetamol 500');
    await page.fill('input[name="genericName"]', 'Paracetamol');
    await page.fill('input[name="brandName"]', 'QA Pharma');
    await page.fill('input[name="category"]', 'Painkillers');
    await page.fill('input[name="manufacturer"]', 'QA Health');
    
    // Pricing
    await page.fill('input[name="purchasePrice"]', '10');
    await page.fill('input[name="sellingPrice"]', '15');
    await page.fill('input[name="mrp"]', '20');
    await page.fill('input[name="gst"]', '12');
    
    // Inventory
    await page.fill('input[name="quantity"]', '100');
    await page.fill('input[name="minimumStockLevel"]', '20');
    await page.fill('input[name="maximumStockLevel"]', '200');
    await page.fill('input[name="supplierId"]', '1');
    
    // Dates & batch
    await page.fill('input[name="batchNumber"]', 'QA-BATCH-1');
    await page.fill('input[name="manufacturingDate"]', '2024-01-01');
    await page.fill('input[name="expiryDate"]', '2026-01-01');

    await page.click('button[type="submit"]');
    
    // Verify redirect to list and new medicine exists
    await expect(page).toHaveURL(/.*\/medicines/);
    await expect(page.getByRole('table')).toContainText('QA Paracetamol 500');
  });

  test('Medicine Creation synchronizes with Inventory', async ({ page }) => {
    await page.goto('/medicines/add');
    
    // Fill basic info
    await page.fill('input[name="name"]', 'QA Inventory Sync Test');
    await page.fill('input[name="genericName"]', 'Test Generic');
    await page.fill('input[name="category"]', 'Testing');
    await page.fill('input[name="manufacturer"]', 'QA Manufacturer');
    
    // Pricing
    await page.fill('input[name="purchasePrice"]', '10');
    await page.fill('input[name="sellingPrice"]', '15');
    await page.fill('input[name="mrp"]', '20');
    
    // Inventory
    await page.fill('input[name="quantity"]', '10');
    await page.fill('input[name="minimumStockLevel"]', '5');
    await page.fill('input[name="maximumStockLevel"]', '50');
    await page.fill('input[name="supplierId"]', '1');
    
    // Dates & batch
    await page.fill('input[name="batchNumber"]', 'SYNC-001');
    await page.fill('input[name="manufacturingDate"]', '2024-01-01');
    await page.fill('input[name="expiryDate"]', '2026-01-01');

    await page.click('button[type="submit"]');
    
    // Ensure it was created
    await expect(page).toHaveURL(/\/medicines$/);

    // Now go to Inventory
    await page.getByRole('link', { name: 'Current Stock', exact: true }).click();
    
    // Search for the newly created medicine
    await page.fill('input[placeholder*="Search inventory"]', 'QA Inventory Sync Test');
    
    // Wait for the table to update
    const row = page.getByRole('row', { name: /QA Inventory Sync Test/i });
    await expect(row).toBeVisible();
    
    // Verify specific values in the row
    await expect(row).toContainText('SYNC-001');
    // Quantity
    await expect(row).toContainText('10');
    // Prices (checking for either 10.00 or $10.00 or ₹10.00)
    await expect(row).toContainText('10.00'); // Purchase Price
    await expect(row).toContainText('15.00'); // Selling Price
  });

  test('Multiple Medicine Creation sync check', async ({ page }) => {
    // Medicine A
    await page.goto('/medicines/add');
    await page.fill('input[name="name"]', 'Medicine A');
    await page.fill('input[name="genericName"]', 'Gen A');
    await page.fill('input[name="category"]', 'Test');
    await page.fill('input[name="manufacturer"]', 'Mfg');
    await page.fill('input[name="purchasePrice"]', '1');
    await page.fill('input[name="sellingPrice"]', '2');
    await page.fill('input[name="mrp"]', '3');
    await page.fill('input[name="quantity"]', '10');
    await page.fill('input[name="supplierId"]', '1');
    await page.fill('input[name="batchNumber"]', 'SYNC-A-001');
    await page.fill('input[name="manufacturingDate"]', '2024-01-01');
    await page.fill('input[name="expiryDate"]', '2026-01-01');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/medicines$/);

    // Medicine B
    await page.goto('/medicines/add');
    await page.fill('input[name="name"]', 'Medicine B');
    await page.fill('input[name="genericName"]', 'Gen B');
    await page.fill('input[name="category"]', 'Test');
    await page.fill('input[name="manufacturer"]', 'Mfg');
    await page.fill('input[name="purchasePrice"]', '4');
    await page.fill('input[name="sellingPrice"]', '5');
    await page.fill('input[name="mrp"]', '6');
    await page.fill('input[name="quantity"]', '7');
    await page.fill('input[name="supplierId"]', '1');
    await page.fill('input[name="batchNumber"]', 'SYNC-B-001');
    await page.fill('input[name="manufacturingDate"]', '2024-01-01');
    await page.fill('input[name="expiryDate"]', '2026-01-01');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/medicines$/);

    // Verify Inventory
    await page.getByRole('link', { name: 'Current Stock', exact: true }).click();
    await page.fill('input[placeholder*="Search inventory"]', 'Medicine A');
    const rowA = page.getByRole('row').filter({ hasText: 'SYNC-A-001' });
    await expect(rowA).toBeVisible();
    await expect(rowA).toContainText('SYNC-A-001');
    await expect(rowA).toContainText('10');

    await page.fill('input[placeholder*="Search inventory"]', 'Medicine B');
    const rowB = page.getByRole('row').filter({ hasText: 'SYNC-B-001' });
    await expect(rowB).toBeVisible();
    await expect(rowB).toContainText('SYNC-B-001');
    await expect(rowB).toContainText('7');
  });
});
