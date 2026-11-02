import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { recordAuditEvent } from './auditApi';

import { isValidIndianMobile, normalizeIndianMobile, isValidEmail } from '../utils/validation';

export const getCustomers = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: localDb.get(KEYS.CUSTOMERS) };
};

export const getCustomerById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const customer = localDb.getById(KEYS.CUSTOMERS, id);
  if (!customer) throw new Error('Customer not found');
  return { data: customer };
};

export const createCustomer = async (data) => {
  const name = data?.name ? data.name.trim() : '';
  if (!name) {
    throw new Error('Customer name is required');
  }
  if (name.length < 2) {
    throw new Error('Customer name must be at least 2 characters');
  }
  if (name.length > 100) {
    throw new Error('Customer name cannot exceed 100 characters');
  }

  const phone = data?.phoneNumber ? data.phoneNumber.trim() : '';
  if (!phone) {
    throw new Error('Customer phone number is required');
  }
  if (!isValidIndianMobile(phone)) {
    throw new Error('Customer phone number must be a valid 10-digit Indian mobile number');
  }

  if (data?.email && data.email.trim() && !isValidEmail(data.email.trim())) {
    throw new Error('Customer email format is invalid');
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  const newCustomer = localDb.insert(KEYS.CUSTOMERS, {
    ...data,
    name,
    phoneNumber: normalizeIndianMobile(phone),
    email: data?.email ? data.email.trim() : '',
    status: data.status || 'Active'
  });
  
  await recordAuditEvent('CREATE', 'Customers', `Created customer ${newCustomer.name}`, newCustomer.id);
  return { data: newCustomer };
};

export const updateCustomer = async (id, data) => {
  if (data?.name !== undefined) {
    const name = data.name.trim();
    if (!name) throw new Error('Customer name cannot be empty');
    if (name.length < 2) throw new Error('Customer name must be at least 2 characters');
    if (name.length > 100) throw new Error('Customer name cannot exceed 100 characters');
  }
  if (data?.phoneNumber !== undefined) {
    const phone = data.phoneNumber.trim();
    if (!phone) throw new Error('Customer phone number cannot be empty');
    if (!isValidIndianMobile(phone)) {
      throw new Error('Customer phone number must be a valid 10-digit Indian mobile number');
    }
  }
  if (data?.email && data.email.trim() && !isValidEmail(data.email.trim())) {
    throw new Error('Customer email format is invalid');
  }

  await new Promise(resolve => setTimeout(resolve, 400));
  const updatedCustomer = localDb.update(KEYS.CUSTOMERS, id, {
    ...data,
    ...(data.name ? { name: data.name.trim() } : {}),
    ...(data.phoneNumber ? { phoneNumber: normalizeIndianMobile(data.phoneNumber) } : {}),
    ...(data.email !== undefined ? { email: data.email.trim() } : {})
  });
  await recordAuditEvent('UPDATE', 'Customers', `Updated customer ${updatedCustomer.name}`, id);
  return { data: updatedCustomer };
};

export const deleteCustomer = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const removed = localDb.remove(KEYS.CUSTOMERS, id);
  await recordAuditEvent('DELETE', 'Customers', `Deleted customer ${removed.name}`, id);
  return { data: { success: true } };
};
