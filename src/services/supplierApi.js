import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { recordAuditEvent } from './auditApi';

export const getSuppliers = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: localDb.get(KEYS.SUPPLIERS) };
};

export const getSupplierById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const supplier = localDb.getById(KEYS.SUPPLIERS, id);
  if (!supplier) throw new Error('Supplier not found');
  return { data: supplier };
};

export const createSupplier = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newSupplier = localDb.insert(KEYS.SUPPLIERS, {
    ...data,
    outstandingAmount: Number(data.outstandingAmount) || 0,
    status: data.status || 'Active'
  });
  
  await recordAuditEvent('CREATE', 'Suppliers', `Created supplier ${newSupplier.supplierName}`, newSupplier.id);
  return { data: newSupplier };
};

export const updateSupplier = async (id, data) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const updatedSupplier = localDb.update(KEYS.SUPPLIERS, id, data);
  await recordAuditEvent('UPDATE', 'Suppliers', `Updated supplier ${updatedSupplier.supplierName}`, id);
  return { data: updatedSupplier };
};

export const deleteSupplier = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const removed = localDb.remove(KEYS.SUPPLIERS, id);
  await recordAuditEvent('DELETE', 'Suppliers', `Deleted supplier ${removed.supplierName}`, id);
  return { data: { success: true } };
};
