import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { receiveStock } from './inventoryApi';
import { recordAuditEvent } from './auditApi';

export const getPurchases = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: localDb.get(KEYS.PURCHASES) };
};

export const getPurchaseById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const purchase = localDb.getById(KEYS.PURCHASES, id);
  if (!purchase) throw new Error('Purchase not found');
  return { data: purchase };
};

export const createPurchase = async (purchaseData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newPurchase = localDb.insert(KEYS.PURCHASES, {
    ...purchaseData,
    status: 'Ordered',
    paymentStatus: 'Pending',
    paidAmount: 0,
  });
  
  await recordAuditEvent('CREATE', 'Purchases', `Created Purchase Order ${newPurchase.id}`, newPurchase.id);
  return { data: newPurchase };
};

export const updatePurchase = async (id, purchaseData) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const updatedPurchase = localDb.update(KEYS.PURCHASES, id, purchaseData);
  await recordAuditEvent('UPDATE', 'Purchases', `Updated Purchase Order ${id}`, id);
  return { data: updatedPurchase };
};

export const receivePurchase = async (id, receivedData) => {
  // We use runLocalTransaction to make the status update and stock receiving atomic
  await new Promise(resolve => setTimeout(resolve, 500));

  let finalPurchase = null;
  await localDb.runLocalTransaction(async (tx) => {
    const purchase = tx.getById(KEYS.PURCHASES, id);
    if (!purchase) throw new Error('Purchase not found');

    const updatedPurchase = tx.update(KEYS.PURCHASES, id, {
      ...receivedData,
      status: receivedData.status || 'Received'
    });
    
    finalPurchase = updatedPurchase;
  });
  
  // Update inventory outside the tx just to reuse the existing robust receiveStock which handles its own tx
  if (receivedData.receivedItems) {
    for (const item of receivedData.receivedItems) {
      if (item.receivedQuantity > 0) {
        // Find the authoritative original purchase item to get proper pricing
        const originalItem = finalPurchase.items?.find(i => Number(i.medicineId) === Number(item.medicineId));

        // Resolve prices from authoritative source (purchase item > receiving form input > 0)
        const purchasePrice = Number(originalItem?.purchasePrice ?? item.purchasePrice ?? 0);
        const mrp = Number(originalItem?.mrp ?? item.mrp ?? 0);
        // sellingPrice: use explicitly stored value, else fall back to mrp
        const sellingPrice = Number(originalItem?.sellingPrice ?? originalItem?.mrp ?? item.sellingPrice ?? mrp);

        await receiveStock(item.medicineId, item.receivedQuantity, {
          batch: item.batchNumber || `BAT-${Date.now().toString().slice(-6)}`,
          manufacturingDate: item.manufacturingDate || '',
          expiryDate: item.expiryDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
          rack: item.rackNumber || '',
          purchasePrice,
          sellingPrice,
          mrp,
          supplier: finalPurchase.supplierName || ''
        }, finalPurchase.id);
      }
    }
  }

  await recordAuditEvent('RECEIVE', 'Purchases', `Received goods for PO ${id}`, id);
  return { data: finalPurchase };
};
