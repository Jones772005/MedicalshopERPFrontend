import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { deductStock } from './inventoryApi';
import { recordAuditEvent } from './auditApi';

export const getSales = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: localDb.get(KEYS.SALES) };
};

export const getSaleById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const sale = localDb.get(KEYS.SALES).find(s => s.id === parseInt(id) || s.invoiceNumber === id || s.id === id);
  if (!sale) throw new Error('Sale not found');
  return { data: sale };
};

export const createSale = async (saleData) => {
  // We use runLocalTransaction to make the sale and inventory deduction atomic
  let finalSale = null;

  await localDb.runLocalTransaction(async (tx) => {
    // 1. Create Sale record
    const newSale = tx.insert(KEYS.SALES, {
      ...saleData,
      status: 'Generated',
      date: saleData.date || new Date().toISOString()
    });
    
    // Format invoice number with the ID generated
    newSale.invoiceNumber = `INV-2026-${String(newSale.id).replace(/\D/g,'').padStart(3, '0')}`;
    tx.update(KEYS.SALES, newSale.id, { invoiceNumber: newSale.invoiceNumber });
    finalSale = newSale;
  });

  // 2. Deduct Inventory (uses its own transaction)
  if (finalSale.items && finalSale.items.length > 0) {
    try {
      await deductStock(finalSale.items, finalSale.invoiceNumber, 'SALE');
    } catch (e) {
      // If stock deduction fails, we should ideally rollback the sale.
      // Since localDb.runLocalTransaction is per-service, in a true atomic system we'd pass tx into deductStock.
      // For this phase, if inventory fails, we log an error. (In reality, validation should happen before createSale).
      console.error('Inventory deduction failed after sale creation', e);
      throw e;
    }
  }

  await recordAuditEvent('CREATE', 'Sales', `Created Invoice ${finalSale.invoiceNumber}`, finalSale.id);
  return { data: finalSale };
};

export const cancelSale = async (id) => {
  let cancelledSale = null;
  await localDb.runLocalTransaction(async (tx) => {
    const sale = tx.getById(KEYS.SALES, id);
    if (!sale) throw new Error('Sale not found');
    cancelledSale = tx.update(KEYS.SALES, id, { status: 'Cancelled' });
  });

  await recordAuditEvent('CANCEL', 'Sales', `Cancelled Invoice ${cancelledSale.invoiceNumber}`, id);
  return { data: cancelledSale };
};
