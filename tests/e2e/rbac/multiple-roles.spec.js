import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';

test.describe('Multi-Role Login', () => {
  const roles = [
    { id: 'administrator', name: 'Administrator', dashboardUrl: '/dashboard' },
    { id: 'pharmacist', name: 'Pharmacist', dashboardUrl: '/dashboard' },
    { id: 'cashier', name: 'Cashier', dashboardUrl: '/dashboard' },
    { id: 'storeManager', name: 'Store Manager', dashboardUrl: '/dashboard' },
    { id: 'purchaseManager', name: 'Purchase Manager', dashboardUrl: '/dashboard' },
    { id: 'accountant', name: 'Accountant', dashboardUrl: '/dashboard' },
    { id: 'generalStaff', name: 'General Staff', dashboardUrl: '/dashboard' },
  ];

  for (const role of roles) {
    test(`Login as ${role.name} verifies UI details`, async ({ page }) => {
      await loginAs(page, role.id);
      
      // Verify Dashboard loads
      await expect(page).toHaveURL(new RegExp(`.*${role.dashboardUrl}`));
      
      // Verify Role is displayed in the header profile
      const profileButton = page.locator('header button:has(svg.lucide-user)');
      await expect(profileButton).toBeVisible();
      
      // The role text is rendered somewhere near the profile button in desktop mode
      await expect(page.locator(`text=${role.name}`).first()).toBeVisible();
    });
  }
});
