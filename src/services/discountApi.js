import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { recordAuditEvent } from './auditApi';

export const getDiscounts = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: localDb.get(KEYS.DISCOUNTS) || [] };
};

export const getDiscountById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const discount = localDb.getById(KEYS.DISCOUNTS, id);
  if (!discount) throw new Error('Discount not found');
  return { data: discount };
};

export const createDiscount = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const existing = (localDb.get(KEYS.DISCOUNTS) || []).filter(d => 
    d.status === 'active' &&
    String(d.medicineId) === String(data.medicineId) &&
    (d.batchNumber === 'All Batches' || d.batchNumber === data.batchNumber || data.batchNumber === 'All Batches')
  );

  const startNewStr = typeof data.validFrom === 'string' && data.validFrom.length === 10 ? data.validFrom + 'T00:00:00' : data.validFrom;
  const endNewStr = typeof data.validUntil === 'string' && data.validUntil.length === 10 ? data.validUntil + 'T00:00:00' : data.validUntil;
  const startNew = new Date(startNewStr).getTime();
  const endNew = new Date(endNewStr).getTime();

  const hasOverlap = existing.some(d => {
    const startExStr = typeof d.validFrom === 'string' && d.validFrom.length === 10 ? d.validFrom + 'T00:00:00' : d.validFrom;
    const endExStr = typeof d.validUntil === 'string' && d.validUntil.length === 10 ? d.validUntil + 'T00:00:00' : d.validUntil;
    const startEx = new Date(startExStr).getTime();
    const endEx = new Date(endExStr).getTime();
    return (startNew <= endEx && endNew >= startEx);
  });

  if (hasOverlap && data.status === 'active') {
    throw new Error('An active discount already exists for this medicine during the selected period.');
  }

  const newDiscount = localDb.insert(KEYS.DISCOUNTS, {
    ...data,
    status: data.status || 'active'
  });
  
  await recordAuditEvent('CREATE', 'Discounts', `Created discount ${newDiscount.name}`, newDiscount.id);
  return { data: newDiscount };
};

export const updateDiscount = async (id, data) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const discount = localDb.getById(KEYS.DISCOUNTS, id);
  if (!discount) throw new Error('Discount not found');

  if (data.status === 'active') {
    const existing = (localDb.get(KEYS.DISCOUNTS) || []).filter(d => 
      String(d.id) !== String(id) &&
      d.status === 'active' &&
      String(d.medicineId) === String(data.medicineId) &&
      (d.batchNumber === 'All Batches' || d.batchNumber === data.batchNumber || data.batchNumber === 'All Batches')
    );

    const startNewStr = typeof data.validFrom === 'string' && data.validFrom.length === 10 ? data.validFrom + 'T00:00:00' : data.validFrom;
    const endNewStr = typeof data.validUntil === 'string' && data.validUntil.length === 10 ? data.validUntil + 'T00:00:00' : data.validUntil;
    const startNew = new Date(startNewStr).getTime();
    const endNew = new Date(endNewStr).getTime();

    const hasOverlap = existing.some(d => {
      const startExStr = typeof d.validFrom === 'string' && d.validFrom.length === 10 ? d.validFrom + 'T00:00:00' : d.validFrom;
      const endExStr = typeof d.validUntil === 'string' && d.validUntil.length === 10 ? d.validUntil + 'T00:00:00' : d.validUntil;
      const startEx = new Date(startExStr).getTime();
      const endEx = new Date(endExStr).getTime();
      return (startNew <= endEx && endNew >= startEx);
    });

    if (hasOverlap) {
      throw new Error('An active discount already exists for this medicine during the selected period.');
    }
  }

  const updatedDiscount = localDb.update(KEYS.DISCOUNTS, id, data);
  await recordAuditEvent('UPDATE', 'Discounts', `Updated discount ${updatedDiscount.name}`, id);
  return { data: updatedDiscount };
};

export const deleteDiscount = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const removed = localDb.remove(KEYS.DISCOUNTS, id);
  await recordAuditEvent('DELETE', 'Discounts', `Archived discount ${removed.name}`, id);
  return { data: { success: true } };
};

export const activateDiscount = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const discount = localDb.getById(KEYS.DISCOUNTS, id);
  if (!discount) throw new Error('Discount not found');

  const existing = (localDb.get(KEYS.DISCOUNTS) || []).filter(d => 
    String(d.id) !== String(id) &&
    d.status === 'active' &&
    String(d.medicineId) === String(discount.medicineId) &&
    (d.batchNumber === 'All Batches' || d.batchNumber === discount.batchNumber || discount.batchNumber === 'All Batches')
  );

  const startNewStr = typeof discount.validFrom === 'string' && discount.validFrom.length === 10 ? discount.validFrom + 'T00:00:00' : discount.validFrom;
  const endNewStr = typeof discount.validUntil === 'string' && discount.validUntil.length === 10 ? discount.validUntil + 'T00:00:00' : discount.validUntil;
  const startNew = new Date(startNewStr).getTime();
  const endNew = new Date(endNewStr).getTime();

  const hasOverlap = existing.some(d => {
    const startExStr = typeof d.validFrom === 'string' && d.validFrom.length === 10 ? d.validFrom + 'T00:00:00' : d.validFrom;
    const endExStr = typeof d.validUntil === 'string' && d.validUntil.length === 10 ? d.validUntil + 'T00:00:00' : d.validUntil;
    const startEx = new Date(startExStr).getTime();
    const endEx = new Date(endExStr).getTime();
    return (startNew <= endEx && endNew >= startEx);
  });

  if (hasOverlap) {
    throw new Error('Cannot activate: An active discount already exists for this medicine during its validity period.');
  }

  const updated = localDb.update(KEYS.DISCOUNTS, id, { status: 'active' });
  await recordAuditEvent('UPDATE', 'Discounts', `Activated discount ${updated.name}`, id);
  return { data: updated };
};

export const deactivateDiscount = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const discount = localDb.getById(KEYS.DISCOUNTS, id);
  if (!discount) throw new Error('Discount not found');
  
  const updated = localDb.update(KEYS.DISCOUNTS, id, { status: 'inactive' });
  await recordAuditEvent('UPDATE', 'Discounts', `Deactivated discount ${updated.name}`, id);
  return { data: updated };
};

export const getActiveDiscounts = async () => {
  const { data } = await getDiscounts();
  // To evaluate currently active:
  const now = new Date();
  now.setHours(0,0,0,0);
  const nowTime = now.getTime();
  
  const active = data.filter(d => {
    if (d.status !== 'active') return false;
    
    const startStr = typeof d.validFrom === 'string' && d.validFrom.length === 10 ? d.validFrom + 'T00:00:00' : d.validFrom;
    const endStr = typeof d.validUntil === 'string' && d.validUntil.length === 10 ? d.validUntil + 'T00:00:00' : d.validUntil;
    
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    
    // Inclusive logic.
    return nowTime >= start && nowTime <= end;
  });
  
  return { data: active };
};

export const getDiscountForMedicine = async (medicineId, batchNumber) => {
  const { data } = await getActiveDiscounts();
  
  const applicable = data.filter(d => 
    String(d.medicineId) === String(medicineId) && 
    (d.batchNumber === batchNumber || d.batchNumber === 'All Batches' || !d.batchNumber)
  );

  if (applicable.length === 0) return { data: null };

  const exactMatch = applicable.find(d => d.batchNumber === batchNumber && d.batchNumber !== 'All Batches');
  return { data: exactMatch || applicable[0] };
};
