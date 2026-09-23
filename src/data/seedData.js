import { KEYS, CURRENT_DB_VERSION } from './storageKeys';
import localDb from '../services/localDb';

// Import all mock data arrays
import { medicinesData } from './medicines';
import { alternativeMedicinesData as alternativeMedicines } from './alternatives';
import { inventoryData } from './inventory';
import { suppliersData } from './suppliers';
import { purchasesData } from './purchases';
import { customersData } from './customers';
import { salesData } from './sales';
import { paymentsData } from './payments';
import { prescriptionsData } from './prescriptions';
import { notificationsData } from './notifications';
import { campaignsData } from './campaigns';
import { mockSettings as settingsData } from './settings';
import { usersData } from './users';
import { mockStaff as staffData } from './staff';
import { mockRoles as rolesData } from './roles';
import { mockAuditLogs as auditLogsData } from './auditLogs';

// Helper to seed array into DB if the key doesn't exist or if force=true
const seedKey = (key, dataArray) => {
  if (!localStorage.getItem(key)) {
    localDb.set(key, dataArray);
  }
};

const normalizeDatabase = () => {
  try {
    // 1. Normalize Payments (Fix PO-null)
    const payments = localDb.get(KEYS.PAYMENTS);
    let changed = false;
    const normalizedPayments = payments.map(p => {
      if (p.referenceId === 'PO-null') {
        changed = true;
        return { ...p, referenceId: null };
      }
      return p;
    });
    if (changed) localDb.set(KEYS.PAYMENTS, normalizedPayments);

    // 2. Normalize Inventory (Fix ₹0 pricing on seeded data if any)
    const inventory = localDb.get(KEYS.INVENTORY);
    changed = false;
    const normalizedInventory = inventory.map(i => {
      let mod = false;
      let newI = { ...i };
      if (!newI.quantity || isNaN(newI.quantity)) { newI.quantity = 0; mod = true; }
      if (!newI.purchasePrice || isNaN(newI.purchasePrice)) { newI.purchasePrice = 0; mod = true; }
      if (!newI.sellingPrice || isNaN(newI.sellingPrice)) { newI.sellingPrice = 0; mod = true; }
      if (!newI.mrp || isNaN(newI.mrp)) { newI.mrp = 0; mod = true; }
      if (mod) changed = true;
      return newI;
    });
    if (changed) localDb.set(KEYS.INVENTORY, normalizedInventory);
    
    // 3. Normalize Purchases (Ensure numeric fields)
    const purchases = localDb.get(KEYS.PURCHASES);
    changed = false;
    const normalizedPurchases = purchases.map(p => {
      let mod = false;
      let newP = { ...p };
      if (newP.items) {
        newP.items = newP.items.map(item => {
          if (!item.purchasePrice || isNaN(item.purchasePrice)) { item.purchasePrice = 0; mod = true; }
          if (!item.mrp || isNaN(item.mrp)) { item.mrp = 0; mod = true; }
          return item;
        });
      }
      if (mod) changed = true;
      return newP;
    });
    if (changed) localDb.set(KEYS.PURCHASES, normalizedPurchases);

  } catch (error) {
    console.error('Failed to normalize database', error);
  }
};

export const initializeDatabase = (force = false) => {
  const currentVersion = localStorage.getItem(KEYS.VERSION);
  
  if (!currentVersion || force) {
    console.log('Initializing LocalStorage ERP Database...');
    
    // Core data
    seedKey(KEYS.MEDICINES, medicinesData);
    seedKey(KEYS.ALTERNATIVES, alternativeMedicines);
    seedKey(KEYS.INVENTORY, inventoryData);
    seedKey(KEYS.INVENTORY_TRANSACTIONS, []);
    
    seedKey(KEYS.SUPPLIERS, suppliersData);
    seedKey(KEYS.PURCHASES, purchasesData);
    seedKey(KEYS.PURCHASE_RETURNS, []);
    
    seedKey(KEYS.CUSTOMERS, customersData);
    seedKey(KEYS.SALES, salesData);
    seedKey(KEYS.SALES_RETURNS, []);
    
    seedKey(KEYS.PAYMENTS, paymentsData);
    seedKey(KEYS.PRESCRIPTIONS, prescriptionsData);
    
    seedKey(KEYS.NOTIFICATIONS, []);
    seedKey(KEYS.CAMPAIGNS, campaignsData);
    seedKey(KEYS.SETTINGS, settingsData);
    
    seedKey(KEYS.USERS, usersData);
    seedKey(KEYS.STAFF, staffData);
    seedKey(KEYS.ROLES, rolesData);
    seedKey(KEYS.AUDIT_LOGS, auditLogsData);

    seedKey(KEYS.BATCHES, []);
    
    // Update version
    localStorage.setItem(KEYS.VERSION, CURRENT_DB_VERSION);
    console.log('Database initialization complete.');
  } else if (parseInt(currentVersion) < CURRENT_DB_VERSION) {
    console.log('Migrating Database...');
    // Future migrations go here
    localStorage.setItem(KEYS.VERSION, CURRENT_DB_VERSION);
  }

  // Always run normalization on start
  normalizeDatabase();
};
