import fs from 'fs';
import { KEYS } from './src/data/storageKeys.js';
import { medicinesData } from './src/data/medicines.js';
import { alternativeMedicinesData } from './src/data/alternatives.js';
import { suppliersData } from './src/data/suppliers.js';
import { customersData } from './src/data/customers.js';
import { mockSettings } from './src/data/settings.js';
import { usersData } from './src/data/users.js';
import { mockStaff } from './src/data/staff.js';
import { mockRoles } from './src/data/roles.js';

// We need to keep only reference data.
// For customers/suppliers, keep only seed ones.
// For inventory, start empty or keep seed inventory but set quantities to 0?
// "Remove previous QA-created inventory/batch records... Do not leave old batches such as MANUAL001"
// Actually, seed inventory has specific batches. Let's start with empty inventory or just the seed inventory.
// Wait, the prompt says "Remove previous QA-created inventory/batch records...". Seed inventory is fine to keep, or we can just empty it.
// Let's keep seed inventory since it's required for some things, but maybe the prompt implies we should start fresh.
// "Remove previous QA-created inventory/batch records so that the fresh test starts with a known inventory state."
// Let's use the seed inventoryData from './src/data/inventory.js'.

import { inventoryData } from './src/data/inventory.js';

const backupData = {
  [KEYS.VERSION]: 1,
  [KEYS.COUNTERS]: {},
  [KEYS.USERS]: usersData,
  [KEYS.STAFF]: mockStaff,
  [KEYS.ROLES]: mockRoles,
  [KEYS.MEDICINES]: medicinesData,
  [KEYS.ALTERNATIVES]: alternativeMedicinesData,
  [KEYS.INVENTORY]: inventoryData,
  [KEYS.INVENTORY_TRANSACTIONS]: [],
  [KEYS.SUPPLIERS]: suppliersData,
  [KEYS.PURCHASES]: [],
  [KEYS.PURCHASE_RETURNS]: [],
  [KEYS.CUSTOMERS]: customersData,
  [KEYS.SALES]: [],
  [KEYS.SALES_RETURNS]: [],
  [KEYS.PAYMENTS]: [],
  [KEYS.PRESCRIPTIONS]: [],
  [KEYS.NOTIFICATIONS]: [],
  [KEYS.AUDIT_LOGS]: [],
  [KEYS.CAMPAIGNS]: [],
  [KEYS.QR]: [],
  [KEYS.SETTINGS]: mockSettings,
  [KEYS.SESSIONS]: []
};

const backupBlob = {
  version: 1,
  exportedAt: new Date().toISOString(),
  application: 'MedicalShopERP',
  data: backupData
};

fs.writeFileSync('qa-reset-backup.json', JSON.stringify(backupBlob, null, 2));
console.log('Created qa-reset-backup.json');
