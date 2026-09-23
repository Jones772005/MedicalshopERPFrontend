import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { recordAuditEvent } from './auditApi';

export const getMedicines = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: localDb.get(KEYS.MEDICINES) };
};

export const getMedicine = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const medicine = localDb.getById(KEYS.MEDICINES, id);
  if (!medicine) throw new Error('Medicine not found');
  return { data: medicine };
};

import { receiveStock } from './inventoryApi';

export const createMedicine = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Set default properties
  const medicineData = { 
    ...data, 
    status: data.status || 'Available',
    stock: Number(data.quantity || data.stock || 0) // Deprecated in favor of inventory batches, but keeping for compatibility if UI needs it
  };
  
  const newMedicine = localDb.insert(KEYS.MEDICINES, medicineData);
  
  // Create initial stock batch if provided
  if (medicineData.stock > 0) {
    const initialBatch = {
      batch: medicineData.batchNumber || medicineData.batch || `BAT-INIT-${Date.now().toString().slice(-4)}`,
      expiryDate: medicineData.expiryDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      purchasePrice: medicineData.purchasePrice || 0,
      sellingPrice: medicineData.sellingPrice || medicineData.mrp || 0,
      mrp: medicineData.mrp || 0,
      supplier: medicineData.supplierId ? `SUP-${medicineData.supplierId}` : 'Initial Stock'
    };
    await receiveStock(newMedicine.id, medicineData.stock, initialBatch, `MED-${newMedicine.id}`);
  }

  await recordAuditEvent('CREATE', 'Medicines', `Created medicine ${newMedicine.name}`, newMedicine.id);
  return { data: newMedicine };
};

export const updateMedicine = async (id, data) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const updatedMedicine = localDb.update(KEYS.MEDICINES, id, data);
  await recordAuditEvent('UPDATE', 'Medicines', `Updated medicine ${updatedMedicine.name}`, id);
  return { data: updatedMedicine };
};

export const deleteMedicine = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const removed = localDb.remove(KEYS.MEDICINES, id);
  await recordAuditEvent('DELETE', 'Medicines', `Deleted medicine ${removed.name}`, id);
  return { data: { success: true } };
};
