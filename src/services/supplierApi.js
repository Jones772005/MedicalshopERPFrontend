import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { recordAuditEvent } from './auditApi';

import { isValidIndianMobile, normalizeIndianMobile, isValidGSTIN, isValidEmail } from '../utils/validation';

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
  const supplierName = data?.supplierName ? data.supplierName.trim() : '';
  if (!supplierName) {
    throw new Error('Supplier name is required');
  }
  if (supplierName.length < 2) {
    throw new Error('Supplier name must be at least 2 characters');
  }
  if (supplierName.length > 100) {
    throw new Error('Supplier name cannot exceed 100 characters');
  }

  const companyName = data?.companyName ? data.companyName.trim() : '';
  if (!companyName) {
    throw new Error('Company name is required');
  }
  if (companyName.length < 2) {
    throw new Error('Company name must be at least 2 characters');
  }

  const phone = data?.phoneNumber ? data.phoneNumber.trim() : '';
  if (!phone) {
    throw new Error('Phone number is required');
  }
  if (!isValidIndianMobile(phone)) {
    throw new Error('Supplier phone number must be a valid 10-digit Indian mobile number');
  }

  if (data?.email && data.email.trim() && !isValidEmail(data.email.trim())) {
    throw new Error('Supplier email format is invalid');
  }

  if (data?.gstNumber && data.gstNumber.trim() && !isValidGSTIN(data.gstNumber.trim())) {
    throw new Error('Supplier GSTIN must contain 15 valid characters');
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  const newSupplier = localDb.insert(KEYS.SUPPLIERS, {
    ...data,
    supplierName,
    companyName,
    phoneNumber: normalizeIndianMobile(phone),
    email: data?.email ? data.email.trim() : '',
    gstNumber: data?.gstNumber && data.gstNumber.trim() ? data.gstNumber.trim().toUpperCase() : '',
    outstandingAmount: Number(data.outstandingAmount) || 0,
    status: data.status || 'Active'
  });
  
  await recordAuditEvent('CREATE', 'Suppliers', `Created supplier ${newSupplier.supplierName}`, newSupplier.id);
  return { data: newSupplier };
};

export const updateSupplier = async (id, data) => {
  if (data?.supplierName !== undefined) {
    const sName = data.supplierName.trim();
    if (!sName) throw new Error('Supplier name cannot be empty');
    if (sName.length < 2) throw new Error('Supplier name must be at least 2 characters');
    if (sName.length > 100) throw new Error('Supplier name cannot exceed 100 characters');
  }
  if (data?.companyName !== undefined) {
    const cName = data.companyName.trim();
    if (!cName) throw new Error('Company name cannot be empty');
    if (cName.length < 2) throw new Error('Company name must be at least 2 characters');
  }
  if (data?.phoneNumber !== undefined) {
    const phone = data.phoneNumber.trim();
    if (!phone) throw new Error('Phone number cannot be empty');
    if (!isValidIndianMobile(phone)) {
      throw new Error('Supplier phone number must be a valid 10-digit Indian mobile number');
    }
  }
  if (data?.email && data.email.trim() && !isValidEmail(data.email.trim())) {
    throw new Error('Supplier email format is invalid');
  }
  if (data?.gstNumber && data.gstNumber.trim() && !isValidGSTIN(data.gstNumber.trim())) {
    throw new Error('Supplier GSTIN must contain 15 valid characters');
  }

  await new Promise(resolve => setTimeout(resolve, 400));
  const updatedSupplier = localDb.update(KEYS.SUPPLIERS, id, {
    ...data,
    ...(data.supplierName ? { supplierName: data.supplierName.trim() } : {}),
    ...(data.companyName ? { companyName: data.companyName.trim() } : {}),
    ...(data.phoneNumber ? { phoneNumber: normalizeIndianMobile(data.phoneNumber) } : {}),
    ...(data.email !== undefined ? { email: data.email.trim() } : {}),
    ...(data.gstNumber !== undefined ? { gstNumber: data.gstNumber.trim().toUpperCase() } : {})
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
