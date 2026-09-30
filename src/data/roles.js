import { buildDefaultPermissions } from './screenPermissions';

// ── Helper ────────────────────────────────────────────────────────────────────
const fullAccess = () => {
  const p = buildDefaultPermissions();
  for (const k of Object.keys(p)) p[k] = true;
  return p;
};

const role = (overrides = {}) => {
  const base = buildDefaultPermissions();
  return { ...base, ...overrides };
};

// ── Seed roles (new flat screen-based permission format) ─────────────────────
export const mockRoles = [
  {
    id: 'ROL-001',
    name: 'Administrator',
    description: 'Full access to all system features and settings',
    userCount: 1,
    permissions: fullAccess(),
  },
  {
    id: 'ROL-002',
    name: 'Pharmacist',
    description: 'Can dispense medicines and verify prescriptions',
    userCount: 3,
    permissions: role({
      // Medicines
      'medicines.view': true,
      'medicines.create': true,
      'medicines.edit': true,

      // Inventory (read + expiry)
      'inventory.stock.view': true,
      'inventory.low-stock.view': true,
      'inventory.out-of-stock.view': true,
      'inventory.expiry.view': true,
      'inventory.transactions.view': true,

      // Purchases (view + receive)
      'purchases.view': true,
      'purchases.receive': true,

      // POS & Sales
      'pos.create': true,
      'sales-history.view': true,
      'sales-history.print': true,
      'sales-history.return': true,
      'sales-returns.view': true,
      'sales-returns.create': true,
      'sales-returns.process': true,

      // Medicine requests
      'medicine-requests.view': true,
      'medicine-requests.create': true,

      // Discounts (view only)
      'discounts.view': true,

      // Customers (view + create)
      'customers.view': true,
      'customers.create': true,

      // Suppliers (view)
      'suppliers.view': true,

      // Payments (view)
      'payments.view': true,

      // Inventory report
      'reports.inventory.view': true,
    }),
  },
  {
    id: 'ROL-003',
    name: 'Cashier',
    description: 'Handles billing and payments',
    userCount: 4,
    permissions: role({
      // Medicines (view only)
      'medicines.view': true,

      // Inventory (view only)
      'inventory.stock.view': true,

      // POS & Sales
      'pos.create': true,
      'sales-history.view': true,
      'sales-history.print': true,
      'sales-history.return': true,
      'sales-returns.view': true,
      'sales-returns.create': true,
      'sales-returns.process': true,

      // Medicine requests
      'medicine-requests.view': true,
      'medicine-requests.create': true,

      // Discounts (view)
      'discounts.view': true,

      // Customers (view + create)
      'customers.view': true,
      'customers.create': true,

      // Payments
      'payments.view': true,
    }),
  },
  {
    id: 'ROL-004',
    name: 'Store Manager',
    description: 'Manages inventory and stock',
    userCount: 2,
    permissions: role({
      // Medicines (view + create + edit)
      'medicines.view': true,
      'medicines.create': true,
      'medicines.edit': true,

      // Full inventory
      'inventory.stock.view': true,
      'inventory.stock.adjust': true,
      'inventory.low-stock.view': true,
      'inventory.out-of-stock.view': true,
      'inventory.expiry.view': true,
      'inventory.expiry.process': true,
      'inventory.transactions.view': true,

      // Purchases (full)
      'purchases.view': true,
      'purchases.create': true,
      'purchases.edit': true,
      'purchases.receive': true,
      'purchase-returns.view': true,
      'purchase-returns.create': true,
      'purchase-returns.process': true,

      // Suppliers (view + create + edit)
      'suppliers.view': true,
      'suppliers.create': true,
      'suppliers.edit': true,

      // Discounts (manage)
      'discounts.view': true,
      'discounts.create': true,
      'discounts.edit': true,
      'discounts.activate': true,

      // Reports (purchases + inventory)
      'reports.purchases.view': true,
      'reports.purchases.export': true,
      'reports.inventory.view': true,
      'reports.inventory.export': true,
    }),
  },
  {
    id: 'ROL-005',
    name: 'Purchase Manager',
    description: 'Handles supplier relationships and stock purchases',
    userCount: 2,
    permissions: role({
      // Medicines (view)
      'medicines.view': true,

      // Inventory (view + reorder-related)
      'inventory.stock.view': true,
      'inventory.low-stock.view': true,
      'inventory.out-of-stock.view': true,
      'inventory.expiry.view': true,
      'inventory.transactions.view': true,

      // Purchases (full)
      'purchases.view': true,
      'purchases.create': true,
      'purchases.edit': true,
      'purchases.receive': true,
      'purchase-returns.view': true,
      'purchase-returns.create': true,
      'purchase-returns.process': true,

      // Suppliers (view + create + edit)
      'suppliers.view': true,
      'suppliers.create': true,
      'suppliers.edit': true,

      // Reports (purchases + inventory)
      'reports.purchases.view': true,
      'reports.purchases.export': true,
      'reports.inventory.view': true,
      'reports.inventory.export': true,
    }),
  },
  {
    id: 'ROL-006',
    name: 'Accountant',
    description: 'Manages payments, taxes, and financial reports',
    userCount: 1,
    permissions: role({
      // Purchases (view only)
      'purchases.view': true,

      // Sales history (view + print)
      'sales-history.view': true,
      'sales-history.print': true,

      // Customers (view)
      'customers.view': true,

      // Suppliers (view)
      'suppliers.view': true,

      // Payments
      'payments.view': true,

      // Discounts (view)
      'discounts.view': true,

      // Full reports
      'reports.sales.view': true,
      'reports.sales.export': true,
      'reports.purchases.view': true,
      'reports.purchases.export': true,
      'reports.financial.view': true,
      'reports.financial.export': true,
      'reports.tax.view': true,
      'reports.tax.export': true,
      'reports.customers.view': true,
      'reports.suppliers.view': true,

      // Settings (tax + invoice)
      'settings.invoice.view': true,
      'settings.invoice.edit': true,
      'settings.tax.view': true,
      'settings.tax.edit': true,
    }),
  },
  {
    id: 'ROL-007',
    name: 'General Staff',
    description: 'Basic access for general staff',
    userCount: 5,
    permissions: role({
      // Medicines (view)
      'medicines.view': true,

      // Inventory (view only)
      'inventory.stock.view': true,

      // Customers (view)
      'customers.view': true,
    }),
  },
];
