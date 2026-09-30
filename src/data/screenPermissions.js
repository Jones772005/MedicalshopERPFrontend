/**
 * screenPermissions.js
 *
 * THE SINGLE SOURCE OF TRUTH for screen-based permissions.
 *
 * Each screen is identified by a stable ID. Permissions are stored as a flat
 * object: { "screen.action": boolean }  — e.g. { "medicines.view": true }.
 *
 * Grouped into visual sections for the permission matrix UI.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * MIGRATION NOTES  (old module-based → new screen-based)
 * ──────────────────────────────────────────────────────────────────────────
 * Old key              → New key(s)
 * dashboard.view       → dashboard.view
 * dashboard.analytics  → analytics.bi.view, analytics.predictions.view
 *
 * medicines.view       → medicines.view
 * medicines.create     → medicines.create
 * medicines.edit       → medicines.edit
 * medicines.delete     → medicines.delete
 *
 * inventory.view       → inventory.stock.view, inventory.low-stock.view, inventory.out-of-stock.view, inventory.fefo.view
 * inventory.adjust     → inventory.stock.adjust
 * inventory.transactions → inventory.transactions.view
 * inventory.expiry     → inventory.expiry.view, inventory.expiry.process
 * inventory.reorder    → (dropped — reorder page removed)
 *
 * purchases.view       → purchases.view
 * purchases.create     → purchases.create
 * purchases.edit       → purchases.edit
 * purchases.receive    → purchases.receive
 * purchases.returns    → purchase-returns.view, purchase-returns.create, purchase-returns.process
 *
 * billing.create       → pos.create, medicine-requests.view
 * billing.edit         → pos.create   (same screen)
 * billing.cancel       → pos.create   (same screen)
 * billing.discount     → pos.create   (same screen)
 * billing.payment      → payments.view
 * billing.print        → sales-history.view
 *
 * customers.view       → customers.view
 * customers.create     → customers.create
 * customers.edit       → customers.edit
 * customers.delete     → customers.delete
 *
 * suppliers.view       → suppliers.view
 * suppliers.create     → suppliers.create
 * suppliers.edit       → suppliers.edit
 * suppliers.delete     → suppliers.delete
 *
 * prescriptions.view   → prescriptions.view
 * prescriptions.create → prescriptions.create
 * prescriptions.verify → prescriptions.verify
 * prescriptions.reject → prescriptions.reject
 *
 * returns.view         → sales-returns.view, purchase-returns.view
 * returns.sales        → sales-returns.create
 * returns.purchases    → purchase-returns.create
 * returns.approve      → purchase-returns.process
 * returns.process      → sales-returns.process, purchase-returns.process
 *
 * reports.sales        → reports.sales
 * reports.purchases    → reports.purchases
 * reports.inventory    → reports.inventory
 * reports.financial    → reports.financial
 * reports.tax          → reports.tax
 * reports.export       → reports.sales, reports.purchases (export is part of each report)
 * customers.view       → reports.customers  (also already customers.view)
 * suppliers.view       → reports.suppliers  (also already suppliers.view)
 *
 * marketing.campaigns  → marketing.campaigns
 * marketing.create_campaign → marketing.create
 * marketing.edit_campaign   → marketing.edit
 * marketing.analytics  → marketing.analytics
 * marketing.qr         → marketing.qr
 *
 * staff.view           → staff.view
 * staff.create         → staff.create
 * staff.edit           → staff.edit
 * staff.deactivate     → staff.delete
 * staff.roles          → roles.view, roles.create, roles.edit, roles.delete
 * staff.permissions    → roles.edit
 *
 * discounts.view       → discounts.view
 * discounts.manage     → discounts.create, discounts.edit, discounts.delete
 * discounts.activate   → discounts.activate
 *
 * settings.view        → settings.pharmacy, settings.notifications, settings.barcode, settings.qr, settings.system
 * settings.edit        → settings.pharmacy
 * settings.tax         → settings.tax
 * settings.invoice     → settings.invoice
 * settings.printer     → settings.printer
 * settings.backup      → settings.backup
 *
 * security.audit       → security.audit-logs
 * security.sessions    → security.sessions
 * security.settings    → settings.security
 */

// ── Section / Screen / Action definitions ───────────────────────────────────
export const SCREEN_SECTIONS = [
  {
    id: 'sales',
    label: 'Sales & Billing',
    screens: [
      {
        id: 'pos',
        label: 'New Bill (POS)',
        actions: [{ id: 'create', label: 'Create Bills' }],
      },
      {
        id: 'sales-history',
        label: 'Sales History',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'print', label: 'Print' },
          { id: 'return', label: 'Initiate Return' },
        ],
      },
      {
        id: 'sales-returns',
        label: 'Sales Returns',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'create', label: 'Create' },
          { id: 'process', label: 'Process / Refund' },
        ],
      },
      {
        id: 'medicine-requests',
        label: 'Medicine Requests',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'create', label: 'Create' },
          { id: 'edit', label: 'Edit' },
          { id: 'delete', label: 'Delete' },
        ],
      },
      {
        id: 'discounts',
        label: 'Discount Management',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'create', label: 'Create' },
          { id: 'edit', label: 'Edit' },
          { id: 'delete', label: 'Delete' },
          { id: 'activate', label: 'Activate / Deactivate' },
        ],
      },
    ],
  },
  {
    id: 'procurement',
    label: 'Procurement',
    screens: [
      {
        id: 'purchases',
        label: 'Purchase Orders',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'create', label: 'Create' },
          { id: 'edit', label: 'Edit' },
          { id: 'receive', label: 'Receive Goods' },
        ],
      },
      {
        id: 'purchase-returns',
        label: 'Purchase Returns',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'create', label: 'Create' },
          { id: 'process', label: 'Process' },
        ],
      },
    ],
  },
  {
    id: 'catalogue',
    label: 'Catalogue',
    screens: [
      {
        id: 'medicines',
        label: 'All Medicines',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'create', label: 'Create' },
          { id: 'edit', label: 'Edit' },
          { id: 'delete', label: 'Delete' },
        ],
      },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    screens: [
      {
        id: 'inventory.stock',
        label: 'Current Stock',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'adjust', label: 'Adjust Stock' },
        ],
      },
      {
        id: 'inventory.low-stock',
        label: 'Low Stock',
        actions: [{ id: 'view', label: 'View' }],
      },
      {
        id: 'inventory.out-of-stock',
        label: 'Out of Stock',
        actions: [{ id: 'view', label: 'View' }],
      },
      {
        id: 'inventory.expiry',
        label: 'Expiry Management',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'process', label: 'Process Expiry' },
        ],
      },
      {
        id: 'inventory.transactions',
        label: 'Stock Transactions',
        actions: [{ id: 'view', label: 'View' }],
      },
    ],
  },
  {
    id: 'stakeholders',
    label: 'Stakeholders',
    screens: [
      {
        id: 'customers',
        label: 'Customers',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'create', label: 'Create' },
          { id: 'edit', label: 'Edit' },
          { id: 'delete', label: 'Delete' },
        ],
      },
      {
        id: 'suppliers',
        label: 'Suppliers',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'create', label: 'Create' },
          { id: 'edit', label: 'Edit' },
          { id: 'delete', label: 'Delete' },
        ],
      },
      {
        id: 'payments',
        label: 'Payments',
        actions: [{ id: 'view', label: 'View' }],
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    screens: [
      {
        id: 'reports.sales',
        label: 'Sales Report',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'export', label: 'Export' },
        ],
      },
      {
        id: 'reports.purchases',
        label: 'Purchases Report',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'export', label: 'Export' },
        ],
      },
      {
        id: 'reports.inventory',
        label: 'Inventory Report',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'export', label: 'Export' },
        ],
      },
      {
        id: 'reports.financial',
        label: 'Financial Report',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'export', label: 'Export' },
        ],
      },
      {
        id: 'reports.tax',
        label: 'Tax Report',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'export', label: 'Export' },
        ],
      },
      {
        id: 'reports.customers',
        label: 'Customers Report',
        actions: [{ id: 'view', label: 'View' }],
      },
      {
        id: 'reports.suppliers',
        label: 'Suppliers Report',
        actions: [{ id: 'view', label: 'View' }],
      },
      {
        id: 'analytics.bi',
        label: 'Business Intelligence',
        actions: [{ id: 'view', label: 'View' }],
      },
      {
        id: 'analytics.predictions',
        label: 'Stock Prediction',
        actions: [{ id: 'view', label: 'View' }],
      },
    ],
  },
  {
    id: 'access-control',
    label: 'Access Control',
    screens: [
      {
        id: 'staff',
        label: 'Staff List',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'create', label: 'Create' },
          { id: 'edit', label: 'Edit' },
          { id: 'delete', label: 'Delete' },
        ],
      },
      {
        id: 'roles',
        label: 'Roles & Permissions',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'create', label: 'Create' },
          { id: 'edit', label: 'Edit' },
          { id: 'delete', label: 'Delete' },
        ],
      },
      {
        id: 'security.audit-logs',
        label: 'Audit Logs',
        actions: [{ id: 'view', label: 'View' }],
      },
      {
        id: 'security.sessions',
        label: 'Active Sessions',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'terminate', label: 'Terminate Sessions' },
        ],
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    screens: [
      {
        id: 'settings.pharmacy',
        label: 'Pharmacy Settings',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'edit', label: 'Edit' },
        ],
      },
      {
        id: 'settings.invoice',
        label: 'Invoice Settings',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'edit', label: 'Edit' },
        ],
      },
      {
        id: 'settings.tax',
        label: 'Tax Settings',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'edit', label: 'Edit' },
        ],
      },
      {
        id: 'settings.printer',
        label: 'Printer Settings',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'edit', label: 'Edit' },
        ],
      },
      {
        id: 'settings.backup',
        label: 'Backup & Restore',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'execute', label: 'Execute Backup' },
        ],
      },
      {
        id: 'settings.security',
        label: 'Security Settings',
        actions: [
          { id: 'view', label: 'View' },
          { id: 'edit', label: 'Edit' },
        ],
      },
    ],
  },
];

// ── Build a flat default permissions object (all false) ──────────────────────
export const buildDefaultPermissions = () => {
  const perms = {};
  for (const section of SCREEN_SECTIONS) {
    for (const screen of section.screens) {
      for (const action of screen.actions) {
        perms[`${screen.id}.${action.id}`] = false;
      }
    }
  }
  return perms;
};

// ── Flat key helper ──────────────────────────────────────────────────────────
export const permKey = (screenId, actionId) => `${screenId}.${actionId}`;

// ── Migration: convert old nested permissions → new flat format ──────────────
export const migratePermissions = (oldPerms) => {
  if (!oldPerms || typeof oldPerms !== 'object') return buildDefaultPermissions();

  // Detect if already new-format (flat: values are booleans directly)
  const sampleKey = Object.keys(oldPerms)[0];
  if (sampleKey && typeof oldPerms[sampleKey] === 'boolean') {
    // Already flat — ensure all new keys exist
    const defaults = buildDefaultPermissions();
    return { ...defaults, ...oldPerms };
  }

  // Old nested format: { module: { action: bool } }
  const p = oldPerms;
  const defaults = buildDefaultPermissions();
  const n = { ...defaults };

  const B = (module, action) => !!(p[module] && p[module][action]);

  // dashboard
  n['analytics.bi.view']           = B('dashboard', 'analytics');
  n['analytics.predictions.view']  = B('dashboard', 'analytics');

  // medicines
  n['medicines.view']   = B('medicines', 'view');
  n['medicines.create'] = B('medicines', 'create');
  n['medicines.edit']   = B('medicines', 'edit');
  n['medicines.delete'] = B('medicines', 'delete');

  // inventory
  n['inventory.stock.view']          = B('inventory', 'view');
  n['inventory.stock.adjust']        = B('inventory', 'adjust');
  n['inventory.low-stock.view']      = B('inventory', 'view');
  n['inventory.out-of-stock.view']   = B('inventory', 'view');
  n['inventory.expiry.view']         = B('inventory', 'expiry');
  n['inventory.expiry.process']      = B('inventory', 'expiry');
  n['inventory.transactions.view']   = B('inventory', 'transactions');

  // purchases
  n['purchases.view']    = B('purchases', 'view');
  n['purchases.create']  = B('purchases', 'create');
  n['purchases.edit']    = B('purchases', 'edit');
  n['purchases.receive'] = B('purchases', 'receive');

  // purchase returns
  n['purchase-returns.view']    = B('purchases', 'returns') || B('returns', 'purchases');
  n['purchase-returns.create']  = B('purchases', 'returns') || B('returns', 'purchases');
  n['purchase-returns.process'] = B('returns', 'approve') || B('returns', 'process');

  // billing / POS
  n['pos.create'] = B('billing', 'create');

  // sales history
  n['sales-history.view']   = B('billing', 'print');
  n['sales-history.print']  = B('billing', 'print');
  n['sales-history.return'] = B('returns', 'sales') || B('returns', 'process');

  // sales returns
  n['sales-returns.view']    = B('returns', 'view') || B('returns', 'sales');
  n['sales-returns.create']  = B('returns', 'sales');
  n['sales-returns.process'] = B('returns', 'process');

  // medicine requests
  n['medicine-requests.view']   = B('billing', 'create');
  n['medicine-requests.create'] = B('billing', 'create');
  n['medicine-requests.edit']   = B('billing', 'edit');
  n['medicine-requests.delete'] = false;

  // discounts
  n['discounts.view']     = B('discounts', 'view');
  n['discounts.create']   = B('discounts', 'manage');
  n['discounts.edit']     = B('discounts', 'manage');
  n['discounts.delete']   = B('discounts', 'manage');
  n['discounts.activate'] = B('discounts', 'activate');

  // customers
  n['customers.view']   = B('customers', 'view');
  n['customers.create'] = B('customers', 'create');
  n['customers.edit']   = B('customers', 'edit');
  n['customers.delete'] = B('customers', 'delete');

  // suppliers
  n['suppliers.view']   = B('suppliers', 'view');
  n['suppliers.create'] = B('suppliers', 'create');
  n['suppliers.edit']   = B('suppliers', 'edit');
  n['suppliers.delete'] = B('suppliers', 'delete');

  // payments
  n['payments.view'] = B('billing', 'payment');

  // reports
  n['reports.sales.view']        = B('reports', 'sales');
  n['reports.sales.export']      = B('reports', 'export');
  n['reports.purchases.view']    = B('reports', 'purchases');
  n['reports.purchases.export']  = B('reports', 'export');
  n['reports.inventory.view']    = B('reports', 'inventory');
  n['reports.inventory.export']  = B('reports', 'export');
  n['reports.financial.view']    = B('reports', 'financial');
  n['reports.financial.export']  = B('reports', 'export');
  n['reports.tax.view']          = B('reports', 'tax');
  n['reports.tax.export']        = B('reports', 'export');
  n['reports.customers.view']    = B('customers', 'view');
  n['reports.suppliers.view']    = B('suppliers', 'view');
  n['analytics.bi.view']         = B('dashboard', 'analytics');
  n['analytics.predictions.view']= B('dashboard', 'analytics');

  // staff
  n['staff.view']   = B('staff', 'view');
  n['staff.create'] = B('staff', 'create');
  n['staff.edit']   = B('staff', 'edit');
  n['staff.delete'] = B('staff', 'deactivate');

  // roles
  n['roles.view']   = B('staff', 'roles');
  n['roles.create'] = B('staff', 'roles');
  n['roles.edit']   = B('staff', 'roles') || B('staff', 'permissions');
  n['roles.delete'] = B('staff', 'roles');

  // security
  n['security.audit-logs.view']     = B('security', 'audit');
  n['security.sessions.view']       = B('security', 'sessions');
  n['security.sessions.terminate']  = B('security', 'sessions');

  // settings
  n['settings.pharmacy.view']  = B('settings', 'view');
  n['settings.pharmacy.edit']  = B('settings', 'edit');
  n['settings.invoice.view']   = B('settings', 'invoice');
  n['settings.invoice.edit']   = B('settings', 'invoice');
  n['settings.tax.view']       = B('settings', 'tax');
  n['settings.tax.edit']       = B('settings', 'tax');
  n['settings.printer.view']   = B('settings', 'printer');
  n['settings.printer.edit']   = B('settings', 'printer');
  n['settings.backup.view']    = B('settings', 'backup');
  n['settings.backup.execute'] = B('settings', 'backup');
  n['settings.security.view']  = B('security', 'settings');
  n['settings.security.edit']  = B('security', 'settings');

  return n;
};

// ── Full-access flat permissions object for Administrator ────────────────────
export const FULL_ACCESS_PERMISSIONS = (() => {
  const perms = buildDefaultPermissions();
  for (const key of Object.keys(perms)) perms[key] = true;
  return perms;
})();
