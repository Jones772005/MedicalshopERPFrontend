import { describe, it, expect } from 'vitest';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../../src/utils/permissions';

describe('Permissions Utilities', () => {
  const adminUser = { role: 'Administrator' };
  const cashierUser = { 
    role: 'Cashier', 
    permissions: { 
      billing: { create: true, payment: true },
      reports: { sales: false }
    }
  };
  
  it('Administrator has all permissions', () => {
    expect(hasPermission(adminUser, 'anything.any')).toBe(true);
    expect(hasAnyPermission(adminUser, ['none.none'])).toBe(true);
    expect(hasAllPermissions(adminUser, ['one', 'two'])).toBe(true);
  });

  it('checks standard permissions correctly', () => {
    expect(hasPermission(cashierUser, 'billing.create')).toBe(true);
    expect(hasPermission(cashierUser, 'billing.delete')).toBe(false); // undefined resolves to false
    expect(hasPermission(cashierUser, 'reports.sales')).toBe(false); // explicit false
  });

  it('checks any permission correctly', () => {
    expect(hasAnyPermission(cashierUser, ['billing.create', 'reports.sales'])).toBe(true);
    expect(hasAnyPermission(cashierUser, ['billing.delete', 'reports.sales'])).toBe(false);
  });

  it('checks all permissions correctly', () => {
    expect(hasAllPermissions(cashierUser, ['billing.create', 'billing.payment'])).toBe(true);
    expect(hasAllPermissions(cashierUser, ['billing.create', 'reports.sales'])).toBe(false);
  });
});
