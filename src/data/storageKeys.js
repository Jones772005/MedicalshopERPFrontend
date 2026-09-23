export const DB_VERSION_KEY = 'medishop-db-version';
export const CURRENT_DB_VERSION = 1;

export const KEYS = {
  // Config
  VERSION: DB_VERSION_KEY,
  COUNTERS: 'medishop-counters', // To keep track of auto-increment IDs
  
  // Auth & RBAC
  USERS: 'medishop-users',
  STAFF: 'medishop-staff',
  ROLES: 'medishop-roles',
  
  // Entities
  MEDICINES: 'medishop-medicines',
  ALTERNATIVES: 'medishop-alternatives',
  BATCHES: 'medishop-batches',
  
  INVENTORY: 'medishop-inventory', // Can be derived, but storing distinct records for speed
  INVENTORY_TRANSACTIONS: 'medishop-inventory-transactions',
  
  SUPPLIERS: 'medishop-suppliers',
  PURCHASES: 'medishop-purchases',
  PURCHASE_RETURNS: 'medishop-purchase-returns',
  
  CUSTOMERS: 'medishop-customers',
  SALES: 'medishop-sales',
  SALES_RETURNS: 'medishop-sales-returns',
  
  PAYMENTS: 'medishop-payments',
  PRESCRIPTIONS: 'medishop-prescriptions',
  
  NOTIFICATIONS: 'medishop-notifications',
  AUDIT_LOGS: 'medishop-audit-logs',
  
  CAMPAIGNS: 'medishop-campaigns',
  QR: 'medishop-qr',
  DISCOUNTS: 'medishop-discounts',
  
  SETTINGS: 'medishop-settings',
  SESSIONS: 'medishop-sessions',
};
