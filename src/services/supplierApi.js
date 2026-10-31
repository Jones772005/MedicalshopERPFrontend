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
  if (!data?.supplierName || !data.supplierName.trim()) {
    throw new Error('Supplier name is required');
  }
  if (!data?.companyName || !data.companyName.trim()) {
    throw new Error('Company name is required');
  }
  if (!data?.phoneNumber || !data.phoneNumber.trim()) {
    throw new Error('Phone number is required');
  }
  await new Promise(resolve => setTimeout(resolve, 500));
  const newSupplier = localDb.insert(KEYS.SUPPLIERS, {
    ...data,
    supplierName: data.supplierName.trim(),
    companyName: data.companyName.trim(),
    phoneNumber: data.phoneNumber.trim(),
    outstandingAmount: Number(data.outstandingAmount) || 0,
    status: data.status || 'Active'
  });
  
  await recordAuditEvent('CREATE', 'Suppliers', `Created supplier ${newSupplier.supplierName}`, newSupplier.id);
  return { data: newSupplier };
};

export const updateSupplier = async (id, data) => {
  if (data?.supplierName !== undefined && !data.supplierName.trim()) {
    throw new Error('Supplier name cannot be empty');
  }
  if (data?.companyName !== undefined && !data.companyName.trim()) {
    throw new Error('Company name cannot be empty');
  }
  if (data?.phoneNumber !== undefined && !data.phoneNumber.trim()) {
    throw new Error('Phone number cannot be empty');
  }
  await new Promise(resolve => setTimeout(resolve, 400));
  const updatedSupplier = localDb.update(KEYS.SUPPLIERS, id, {
    ...data,
    ...(data.supplierName ? { supplierName: data.supplierName.trim() } : {}),
    ...(data.companyName ? { companyName: data.companyName.trim() } : {}),
    ...(data.phoneNumber ? { phoneNumber: data.phoneNumber.trim() } : {})
  });
  await recordAuditEvent('UPDATE', 'Suppliers', `Updated supplier ${updatedSupplier.supplierName}`, id);
  return { data: updatedSupplier };
};

export const deleteSupplier = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const removed = localDb.remove(KEYS.SUPPLIERS, id);
  await recordAuditEvent('DELETE', 'Suppliers', `Deleted supplier ${removed.supplierName}`, id);
  return { data: { success: true } };
};
