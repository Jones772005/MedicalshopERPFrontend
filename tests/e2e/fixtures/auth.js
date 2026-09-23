import { expect } from '@playwright/test';

const ROLE_CREDENTIALS = {
  administrator: 'admin@medishop.com',
  pharmacist: 'pharmacist@medishop.com',
  cashier: 'cashier@medishop.com',
  storeManager: 'manager@medishop.com',
  purchaseManager: 'purchase@medishop.com',
  accountant: 'accountant@medishop.com',
  generalStaff: 'staff@medishop.com'
};

export const loginAs = async (page, role) => {
  const email = ROLE_CREDENTIALS[role];
  if (!email) throw new Error(`Role ${role} not found in credentials map.`);
  
  // Clear any existing state
  await page.goto('/login'); // Need to be on the origin to clear localStorage
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard
  await expect(page).toHaveURL(/.*\/dashboard/);
};
