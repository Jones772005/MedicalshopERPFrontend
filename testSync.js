import localDb from './src/services/localDb.js';
import { KEYS } from './src/data/storageKeys.js';
import { createMedicine } from './src/services/medicineApi.js';
import { getInventory } from './src/services/inventoryApi.js';

async function test() {
  localStorage.setItem(KEYS.MEDICINES, '[]');
  localStorage.setItem(KEYS.INVENTORY, '[]');
  
  const data = {
    name: 'QA Sync Test',
    genericName: 'Gen',
    category: 'Test',
    manufacturer: 'Mfg',
    purchasePrice: 10,
    sellingPrice: 15,
    mrp: 20,
    quantity: 10,
    batchNumber: 'SYNC-001',
    expiryDate: '2026-01-01'
  };

  await createMedicine(data);
  
  const inventory = await getInventory();
  console.log("INVENTORY AFTER CREATION:");
  console.log(JSON.stringify(inventory.data, null, 2));
}
test();
