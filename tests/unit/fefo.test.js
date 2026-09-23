import { describe, it, expect } from 'vitest';
import { getValidBatches, getFefoRecommendedBatch } from '../../src/utils/stockUtils';

describe('FEFO \u0026 Stock Utilities', () => {
  const medicineId = 1;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const inventoryItems = [
    { id: 1, medicineId: 1, batchNumber: 'B1', expiryDate: nextMonth.toISOString(), quantity: 10 },
    { id: 2, medicineId: 1, batchNumber: 'B2', expiryDate: tomorrow.toISOString(), quantity: 5 },
    { id: 3, medicineId: 1, batchNumber: 'B3', expiryDate: lastMonth.toISOString(), quantity: 20 }, // Expired
    { id: 4, medicineId: 1, batchNumber: 'B4', expiryDate: tomorrow.toISOString(), quantity: 0 },  // No stock
    { id: 5, medicineId: 2, batchNumber: 'B5', expiryDate: nextMonth.toISOString(), quantity: 10 }, // Different Med
  ];

  it('gets valid batches correctly', () => {
    const valid = getValidBatches(inventoryItems, medicineId);
    
    // Should filter out expired, zero-stock, and different medicine batches
    expect(valid).toHaveLength(2);
    
    // Should sort by earliest expiry first (B2 then B1)
    expect(valid[0].batchNumber).toBe('B2');
    expect(valid[1].batchNumber).toBe('B1');
  });

  it('gets FEFO recommended batch', () => {
    const recommended = getFefoRecommendedBatch(inventoryItems, medicineId);
    
    // Should recommend B2 (earliest expiry, valid stock)
    expect(recommended.batchNumber).toBe('B2');
  });
});
