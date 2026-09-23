import localDb from './localDb';
import { KEYS } from '../data/storageKeys';

export const getInventory = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // In our architecture, KEYS.INVENTORY effectively stores individual batches.
  // We compute status on the fly based on current quantity if needed, but for simplicity we rely on stored data.
  const inventory = localDb.get(KEYS.INVENTORY) || [];
  return { data: inventory };
};

// ── SHARED INVENTORY HELPERS ─────────────────────────────────
// Ensures Dashboard numbers exactly match Inventory page lists.

export const getDaysRemaining = (expiryDate) => {
  if (!expiryDate) return Infinity;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getExpiryCategory = (daysRemaining) => {
  if (daysRemaining < 0) return 'Expired';
  if (daysRemaining <= 7) return 'Within 7 Days';
  if (daysRemaining <= 30) return 'Within 30 Days';
  if (daysRemaining <= 60) return 'Within 60 Days';
  if (daysRemaining <= 90) return 'Within 90 Days';
  return 'Normal';
};

export const getLowStockItems = (inventory) => {
  // Uses canonical minimumStockLevel per medicine. Fallback to 0 if not configured.
  const medicines = localDb.get(KEYS.MEDICINES) || [];
  const minStockMap = {};
  medicines.forEach(m => { minStockMap[m.id] = Number(m.minimumStockLevel); });
  
  return inventory.filter(item => {
    if (item.quantity === 0 || item.status === 'Out of Stock') return false; // Handled by Out of Stock
    
    const minStock = minStockMap[item.medicineId];
    const threshold = minStock !== undefined && !isNaN(minStock) ? minStock : 0;
    
    return item.quantity <= threshold;
  }).map(item => ({
    ...item,
    minStock: minStockMap[item.medicineId] !== undefined && !isNaN(minStockMap[item.medicineId]) ? minStockMap[item.medicineId] : 0
  }));
};

export const getOutOfStockItems = (inventory) => {
  // Matches OutOfStockList.jsx logic
  const medicines = localDb.get(KEYS.MEDICINES) || [];
  const minStockMap = {};
  medicines.forEach(m => { minStockMap[m.id] = Number(m.minimumStockLevel); });

  return inventory.filter(item => item.quantity === 0 || item.status === 'Out of Stock')
    .map(item => ({
      ...item,
      minStock: minStockMap[item.medicineId] !== undefined && !isNaN(minStockMap[item.medicineId]) ? minStockMap[item.medicineId] : 0
    }));
};

export const getExpiredItems = (inventory) => {
  // Matches ExpiryManagement.jsx logic
  return inventory.filter(item => {
    const days = getDaysRemaining(item.expiryDate);
    return getExpiryCategory(days) === 'Expired';
  });
};

export const getNearExpiryItems = (inventory) => {
  // Matches ExpiryManagement.jsx logic (excluding expired)
  return inventory.filter(item => {
    const category = getExpiryCategory(getDaysRemaining(item.expiryDate));
    return category !== 'Normal' && category !== 'Expired';
  });
};
// ─────────────────────────────────────────────────────────────

export const updateInventoryItem = async (id, updates) => {
  return localDb.runLocalTransaction(async (tx) => {
    tx.update(KEYS.INVENTORY, id, updates);
  });
};

/**
 * Returns a map of medicineId -> totalAvailableQuantity
 * by summing all inventory batches (quantity > 0).
 */
export const getMedicineStock = () => {
  const inventory = localDb.get(KEYS.INVENTORY);
  const stockMap = {};
  for (const batch of inventory) {
    const mid = batch.medicineId;
    stockMap[mid] = (stockMap[mid] || 0) + (Number(batch.quantity) || 0);
  }
  return stockMap;
};

/**
 * Get FEFO-sorted available batches for a specific medicine.
 * Returns batches with quantity > 0, sorted by expiryDate ascending.
 */
export const getAvailableBatchesForMedicine = (medicineId) => {
  const inventory = localDb.get(KEYS.INVENTORY);
  return inventory
    .filter(b => b.medicineId === medicineId && Number(b.quantity) > 0)
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
};


export const getTransactions = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: localDb.get(KEYS.INVENTORY_TRANSACTIONS) };
};

export const receiveStock = async (medicineId, quantity, batchDetails, referenceId = null) => {
  return localDb.runLocalTransaction(async (tx) => {
    // 1. Check if batch exists
    const inventory = tx.get(KEYS.INVENTORY);
    const existingBatchIndex = inventory.findIndex(i => i.medicineId === medicineId && i.batch === batchDetails.batch);
    
    let previousStock = 0;
    let newStock = quantity;

    if (existingBatchIndex !== -1) {
      previousStock = inventory[existingBatchIndex].quantity;
      newStock = previousStock + Number(quantity);
      
      let status = 'Available';
      if (newStock === 0) {
        status = 'Out of Stock';
      } else {
        const medicines = tx.get(KEYS.MEDICINES);
        const medicine = medicines.find(m => m.id === medicineId);
        const threshold = medicine && medicine.minimumStockLevel !== undefined ? Number(medicine.minimumStockLevel) : 0;
        if (newStock <= threshold) status = 'Low Stock';
      }

      const updateData = {
        quantity: newStock,
        status,
        updatedAt: new Date().toISOString()
      };
      
      // Preserve/update rack if provided during receiving
      if (batchDetails.rack) {
        updateData.rack = batchDetails.rack;
      }

      tx.update(KEYS.INVENTORY, inventory[existingBatchIndex].id, updateData);
    } else {
      // Create new batch
      const medicines = tx.get(KEYS.MEDICINES);
      const medicine = medicines.find(m => m.id === medicineId);
      
      tx.insert(KEYS.INVENTORY, {
        medicineId,
        medicineName: medicine ? medicine.name : 'Unknown Medicine',
        batch: batchDetails.batch,
        quantity: Number(quantity),
        purchasePrice: Number(batchDetails.purchasePrice),
        sellingPrice: Number(batchDetails.sellingPrice),
        mrp: Number(batchDetails.mrp),
        expiryDate: batchDetails.expiryDate,
        rack: batchDetails.rack || (medicine ? medicine.rackNumber : ''),
        supplier: batchDetails.supplier || '',
        status: 'Available'
      });
    }

    // 2. Create transaction
    const medicines = tx.get(KEYS.MEDICINES);
    const medicine = medicines.find(m => m.id === medicineId);
    tx.insert(KEYS.INVENTORY_TRANSACTIONS, {
      date: new Date().toISOString(),
      medicine: medicine ? medicine.name : 'Unknown Medicine',
      batch: batchDetails.batch,
      type: 'PURCHASE_RECEIPT',
      quantity: Number(quantity),
      previousStock,
      newStock,
      reference: referenceId,
      user: 'System'
    });
  });
};

export const deductStock = async (items, referenceId = null, type = 'SALE') => {
  return localDb.runLocalTransaction(async (tx) => {
    const inventory = tx.get(KEYS.INVENTORY);
    
    for (const item of items) {
      const existingBatch = inventory.find(i => i.medicineId === item.medicineId && i.batch === item.batchNumber);
      if (!existingBatch) {
        throw new Error(`Batch ${item.batchNumber} for medicine ${item.medicineId} not found in inventory.`);
      }

      if (existingBatch.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${existingBatch.medicineName} batch ${existingBatch.batch}. Required: ${item.quantity}, Available: ${existingBatch.quantity}`);
      }

      const previousStock = existingBatch.quantity;
      const newStock = previousStock - Number(item.quantity);

      let status = 'Available';
      if (newStock === 0) {
        status = 'Out of Stock';
      } else {
        const medicines = tx.get(KEYS.MEDICINES);
        const medicine = medicines.find(m => m.id === existingBatch.medicineId);
        const threshold = medicine && medicine.minimumStockLevel !== undefined ? Number(medicine.minimumStockLevel) : 0;
        if (newStock <= threshold) status = 'Low Stock';
      }

      tx.update(KEYS.INVENTORY, existingBatch.id, {
        quantity: newStock,
        status
      });

      tx.insert(KEYS.INVENTORY_TRANSACTIONS, {
        date: new Date().toISOString(),
        medicine: existingBatch.medicineName,
        batch: existingBatch.batch,
        type,
        quantity: -Number(item.quantity),
        previousStock,
        newStock,
        reference: referenceId,
        user: 'System'
      });
    }
  });
};

export const returnStock = async (medicineId, batchNumber, quantity, referenceId = null, type = 'SALES_RETURN') => {
  return localDb.runLocalTransaction(async (tx) => {
    const inventory = tx.get(KEYS.INVENTORY);
    const existingBatch = inventory.find(i => i.medicineId === medicineId && i.batch === batchNumber);
    
    if (!existingBatch) {
      throw new Error(`Batch ${batchNumber} not found.`);
    }

    const previousStock = existingBatch.quantity;
    const newStock = previousStock + Number(quantity);

    let status = 'Available';
    if (newStock === 0) {
      status = 'Out of Stock';
    } else {
      const medicines = tx.get(KEYS.MEDICINES);
      const medicine = medicines.find(m => m.id === medicineId);
      const threshold = medicine && medicine.minimumStockLevel !== undefined ? Number(medicine.minimumStockLevel) : 0;
      if (newStock <= threshold) status = 'Low Stock';
    }

    tx.update(KEYS.INVENTORY, existingBatch.id, {
      quantity: newStock,
      status
    });

    tx.insert(KEYS.INVENTORY_TRANSACTIONS, {
      date: new Date().toISOString(),
      medicine: existingBatch.medicineName,
      batch: existingBatch.batch,
      type,
      quantity: Number(quantity),
      previousStock,
      newStock,
      reference: referenceId,
      user: 'System'
    });
  });
};
