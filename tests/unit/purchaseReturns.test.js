import { describe, it, expect, beforeEach } from 'vitest';
import localDb from '../../src/services/localDb';
import { KEYS } from '../../src/data/storageKeys';
import { createPurchaseReturn } from '../../src/services/returnApi';

// Mock localStorage
const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = String(value); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

global.window = {
  dispatchEvent: () => {}
};

describe('Purchase Return Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    
    // Seed initial data
    localDb.set(KEYS.MEDICINES, [{ id: 1, name: 'QA Test Medicine 2' }]);
    
    // 20 received items
    localDb.set(KEYS.INVENTORY, [
      { id: 1, medicineId: 1, medicineName: 'QA Test Medicine 2', batch: 'QA-PURCHASE-001', quantity: 20, status: 'Available' }
    ]);
    
    // The purchase order
    localDb.set(KEYS.PURCHASES, [
      {
        id: 'PUR-000001',
        purchaseOrderNumber: 'PO-2026-001',
        status: 'Received',
        items: [{ medicineId: 1, quantity: 20 }], // Ordered 20
        receivedItems: [{ medicineId: 1, receivedQuantity: 20, batchNumber: 'QA-PURCHASE-001', purchasePrice: 10 }] // Received 20
      }
    ]);
    
    // Empty initial lists
    localDb.set(KEYS.PURCHASE_RETURNS, []);
    localDb.set(KEYS.INVENTORY_TRANSACTIONS, []);
  });

  it('Valid purchase return decreases inventory and creates correct records', async () => {
    const returnData = {
      purchaseId: 'PUR-000001',
      items: [
        { medicineId: 1, batchNumber: 'QA-PURCHASE-001', quantity: 1, purchasePrice: 10 }
      ]
    };
    
    const result = await createPurchaseReturn(returnData);
    
    // 1. Return record is created
    expect(result.data).toBeDefined();
    expect(result.data.type).toBe('Purchase');
    
    // 2. Valid purchase return decreases inventory
    const inventory = localDb.get(KEYS.INVENTORY);
    expect(inventory[0].quantity).toBe(19);
    
    // 3. Inventory transaction is created
    const tx = localDb.get(KEYS.INVENTORY_TRANSACTIONS);
    expect(tx.length).toBe(1);
    expect(tx[0].type).toBe('PURCHASE_RETURN');
    expect(tx[0].quantity).toBe(-1);
    
    // 4. Returned quantity is associated with the correct batch
    expect(tx[0].batch).toBe('QA-PURCHASE-001');
  });

  it('A return exceeding the purchased quantity is rejected', async () => {
    const returnData = {
      purchaseId: 'PUR-000001',
      items: [
        { medicineId: 1, batchNumber: 'QA-PURCHASE-001', quantity: 21, purchasePrice: 10 }
      ]
    };
    
    await expect(createPurchaseReturn(returnData)).rejects.toThrow(/Cannot return more than originally purchased/);
  });
  
  it('Previously returned quantity is respected', async () => {
    const returnData1 = {
      purchaseId: 'PUR-000001',
      items: [{ medicineId: 1, batchNumber: 'QA-PURCHASE-001', quantity: 19, purchasePrice: 10 }]
    };
    await createPurchaseReturn(returnData1);
    
    const returnData2 = {
      purchaseId: 'PUR-000001',
      items: [{ medicineId: 1, batchNumber: 'QA-PURCHASE-001', quantity: 2, purchasePrice: 10 }]
    };
    
    // Total is 21 > 20, should be rejected
    await expect(createPurchaseReturn(returnData2)).rejects.toThrow(/Cannot return more than originally purchased/);
  });
});
