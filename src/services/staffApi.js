import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { recordAuditEvent } from './auditApi';

export const getStaffMembers = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: localDb.get(KEYS.STAFF) };
};

export const getStaffById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const staff = localDb.getById(KEYS.STAFF, id);
  if (!staff) throw new Error('Staff member not found');
  return { data: staff };
};

export const createStaff = async (staffData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newStaff = localDb.insert(KEYS.STAFF, {
    ...staffData,
    status: staffData.status || 'Active'
  });
  await recordAuditEvent('CREATE', 'Staff', `Created staff member ${newStaff.firstName} ${newStaff.lastName}`, newStaff.id);
  return { data: newStaff };
};

export const updateStaff = async (id, staffData) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const updatedStaff = localDb.update(KEYS.STAFF, id, staffData);
  await recordAuditEvent('UPDATE', 'Staff', `Updated staff member ${updatedStaff.firstName} ${updatedStaff.lastName}`, id);
  return { data: updatedStaff };
};

export const updateStaffStatus = async (id, status) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const updatedStaff = localDb.update(KEYS.STAFF, id, { status });
  await recordAuditEvent('UPDATE', 'Staff', `Updated status of staff ${id} to ${status}`, id);
  return { data: updatedStaff };
};
