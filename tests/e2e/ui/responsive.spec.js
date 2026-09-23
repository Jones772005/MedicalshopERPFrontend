import { test, expect } from '../fixtures/test';
import { loginAs } from '../fixtures/auth';

test.describe('Responsive Layout', () => {
  test('Mobile layout renders correctly', async ({ page, isMobile }) => {
    // Only run if the project is configured as mobile
    if (!isMobile) test.skip();
    
    await loginAs(page, 'administrator');
    
    // Verify mobile specific UI behaviors
    // E.g., sidebar might be hidden by default on mobile
    const sidebar = page.locator('aside');
    await expect(sidebar).not.toBeInViewport();
    // In this app, there is no hamburger menu implemented yet.
    // The test just ensures the main layout and content are visible on mobile.
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  });
});
