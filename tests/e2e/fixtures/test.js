/* eslint-disable */
import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', exception => {
      errors.push(exception.message);
    });
    
    // Some React hydration errors or warnings might come as console.error
    // But we only want to fail on actual unhandled exceptions or critical errors
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('TypeError')) {
        errors.push(msg.text());
      }
    });

    await use(page);

    if (errors.length > 0) {
      throw new Error(`Page had errors:\n${errors.join('\n')}`);
    }
  },
});

export { expect } from '@playwright/test';
