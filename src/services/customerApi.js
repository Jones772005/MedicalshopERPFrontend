import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { recordAuditEvent } from './auditApi';

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
  await new Promise(resolve => setTimeout(resolve, 500));
  const newCustomer = localDb.insert(KEYS.CUSTOMERS, {
    ...data,
    status: data.status || 'Active'
  });
  
  await recordAuditEvent('CREATE', 'Customers', `Created customer ${newCustomer.name}`, newCustomer.id);
  return { data: newCustomer };
};

export const updateCustomer = async (id, data) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const updatedCustomer = localDb.update(KEYS.CUSTOMERS, id, data);
  await recordAuditEvent('UPDATE', 'Customers', `Updated customer ${updatedCustomer.name}`, id);
  return { data: updatedCustomer };
};

export const deleteCustomer = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const removed = localDb.remove(KEYS.CUSTOMERS, id);
  await recordAuditEvent('DELETE', 'Customers', `Deleted customer ${removed.name}`, id);
  return { data: { success: true } };
};
