import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { deductStock, returnStock } from './inventoryApi';
import { recordAuditEvent } from './auditApi';

export const getSalesReturns = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: localDb.get(KEYS.SALES_RETURNS) };
};

export const getPurchaseReturns = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: localDb.get(KEYS.PURCHASE_RETURNS) };
};

export const createSalesReturn = async (returnData) => {
  let finalReturn = null;
  await localDb.runLocalTransaction(async (tx) => {
    // Validate quantities against original sale
    const sale = tx.getById(KEYS.SALES, returnData.saleId);
    if (sale) {
      for (const item of returnData.items) {
        const originalItem = sale.items.find(i => i.medicineId === item.medicineId && (i.batchNumber === item.batchNumber || i.batch === item.batchNumber));
        if (!originalItem) throw new Error(`Item ${item.medicineId} batch ${item.batchNumber} was not in original sale.`);
        
        // Count previous returns
        const pastReturns = tx.get(KEYS.SALES_RETURNS).filter(r => r.saleId == sale.id);
        const pastReturnedQty = pastReturns.reduce((acc, r) => {
          const rItem = r.items?.find(i => i.medicineId === item.medicineId && (i.batchNumber === item.batchNumber || i.batch === item.batchNumber));
          return acc + (rItem ? rItem.quantity : 0);
        }, 0);

        if (pastReturnedQty + item.quantity > originalItem.quantity) {
          throw new Error(`Cannot return more than originally sold. Sold: ${originalItem.quantity}, Previously returned: ${pastReturnedQty}, Trying to return: ${item.quantity}`);
        }
      }
    }

    finalReturn = tx.insert(KEYS.SALES_RETURNS, {
      ...returnData,
      type: 'Sale',
      status: 'Pending Refund',
      date: new Date().toISOString()
    });

    // Payment creation is now handled separately via Record Refund UI
  });

  // Adjust inventory (increase stock)
  if (finalReturn.items) {
    for (const item of finalReturn.items) {
      await returnStock(item.medicineId, item.batchNumber, item.quantity, finalReturn.id, 'SALES_RETURN');
    }
  }

  await recordAuditEvent('CREATE', 'Returns', `Processed sales return ${finalReturn.id}`, finalReturn.id);
  return { data: finalReturn };
};

export const createPurchaseReturn = async (returnData) => {
  let finalReturn = null;
  await localDb.runLocalTransaction(async (tx) => {
    
    if (returnData.purchaseId) {
      const purchase = tx.getById(KEYS.PURCHASES, returnData.purchaseId);
      if (purchase) {
        for (const item of returnData.items) {
          // The source of truth for batches is receivedItems. Fallback to items only if receivedItems doesn't exist.
          const sourceItems = (purchase.receivedItems && purchase.receivedItems.length > 0) ? purchase.receivedItems : (purchase.items || []);
          const originalItem = sourceItems.find(i => String(i.medicineId) === String(item.medicineId) && (i.batchNumber === item.batchNumber || i.batch === item.batchNumber));
          
          if (!originalItem) {
            throw new Error(`Item ${item.medicineId} batch ${item.batchNumber} was not found in the received batches for this purchase.`);
          }
          
          const pastReturns = tx.get(KEYS.PURCHASE_RETURNS).filter(r => String(r.purchaseId) === String(purchase.id));
          const pastReturnedQty = pastReturns.reduce((acc, r) => {
            const rItem = r.items?.find(i => String(i.medicineId) === String(item.medicineId) && (i.batchNumber === item.batchNumber || i.batch === item.batchNumber));
            return acc + (rItem ? Number(rItem.quantity || 0) : 0);
          }, 0);

          // Available to return is the received quantity, or ordered quantity if received is not populated
          const availableToReturn = Number(originalItem.receivedQuantity ?? originalItem.quantity ?? 0);

          if (pastReturnedQty + Number(item.quantity || 0) > availableToReturn) {
            throw new Error(`Cannot return more than originally received. Received: ${availableToReturn}, Previously returned: ${pastReturnedQty}, Trying to return: ${item.quantity}`);
          }
        }
      }
    }

    finalReturn = tx.insert(KEYS.PURCHASE_RETURNS, {
      ...returnData,
      type: 'Purchase',
      status: 'Processed',
      date: new Date().toISOString()
    });

    if (returnData.refundAmount && returnData.refundAmount > 0) {
      tx.insert(KEYS.PAYMENTS, {
        date: new Date().toISOString(),
        type: 'Refund',
        referenceId: finalReturn.id,
        reference: finalReturn.id, // finalReturn.id already contains the PR- prefix
        supplierId: returnData.supplierId,
        supplierName: returnData.supplierName,
        amount: returnData.refundAmount,
        paymentMethod: returnData.paymentMethod || 'Bank Transfer',
        status: 'Completed',
        notes: `Refund for Purchase Return ${finalReturn.id}`
      });
    }
  });

  // Adjust inventory (decrease stock)
  if (finalReturn.items) {
    await deductStock(finalReturn.items, finalReturn.id, 'PURCHASE_RETURN');
  }

  await recordAuditEvent('CREATE', 'Returns', `Processed purchase return ${finalReturn.id}`, finalReturn.id);
  return { data: finalReturn };
};

export const recordSalesReturnRefund = async (returnId, refundData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let paymentRecord = null;
  
  await localDb.runLocalTransaction(async (tx) => {
    const sReturn = tx.getById(KEYS.SALES_RETURNS, returnId);
    if (!sReturn) throw new Error('Sales Return not found');
    if (sReturn.status === 'Refunded' || sReturn.status === 'Processed') {
      throw new Error('This return has already been refunded.');
    }
    
    if (!refundData.amount || refundData.amount <= 0) {
      throw new Error('Refund amount must be greater than 0.');
    }
    
    if (refundData.amount > sReturn.refundAmount) {
      throw new Error('Refund amount cannot exceed the total return amount.');
    }

    // Check for existing refund payment to prevent duplicates
    const allPayments = tx.get(KEYS.PAYMENTS) || [];
    const existingRefund = allPayments.find(p => 
      p.type === 'Refund' && 
      (p.referenceId === String(returnId) || p.reference === String(returnId))
    );
    
    if (existingRefund) {
      throw new Error('A refund payment already exists for this return.');
    }

    paymentRecord = tx.insert(KEYS.PAYMENTS, {
      date: new Date().toISOString(),
      type: 'Refund',
      referenceId: sReturn.id,
      reference: sReturn.id,
      customerId: sReturn.customerId,
      customerName: sReturn.customerName || 'Walk-in Customer',
      amount: refundData.amount,
      paymentMethod: refundData.paymentMethod || 'Cash',
      status: 'Completed',
      notes: refundData.notes || `Refund for Sales Return ${sReturn.id}`
    });

    // Update return status
    tx.update(KEYS.SALES_RETURNS, sReturn.id, {
      status: 'Refunded'
    });
  });

  await recordAuditEvent('CREATE', 'Payments', `Recorded refund for return ${returnId}`, paymentRecord.id);
  
  return { data: paymentRecord };
};
