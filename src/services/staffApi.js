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
  if (!staffData?.firstName || !staffData.firstName.trim()) throw new Error('First name is required');
  if (!staffData?.lastName || !staffData.lastName.trim()) throw new Error('Last name is required');
  if (!staffData?.email || !staffData.email.trim()) throw new Error('Email is required');
  if (!staffData?.username || !staffData.username.trim()) throw new Error('Username is required');

  await new Promise(resolve => setTimeout(resolve, 500));
  const newStaff = localDb.insert(KEYS.STAFF, {
    ...staffData,
    firstName: staffData.firstName.trim(),
    lastName: staffData.lastName.trim(),
    email: staffData.email.trim(),
    username: staffData.username.trim(),
    status: staffData.status || 'Active'
  });
  await recordAuditEvent('CREATE', 'Staff', `Created staff member ${newStaff.firstName} ${newStaff.lastName}`, newStaff.id);
  return { data: newStaff };
};

export const updateStaff = async (id, staffData) => {
  const existing = localDb.getById(KEYS.STAFF, id);
  if (!existing) throw new Error('Staff member not found');

  const isProtectedAdmin = existing.role === 'Administrator' || existing.username === 'admin';
  const finalData = { ...staffData };
  if (isProtectedAdmin) {
    finalData.role = 'Administrator';
    finalData.status = 'Active';
  }

  await new Promise(resolve => setTimeout(resolve, 400));
  const updatedStaff = localDb.update(KEYS.STAFF, id, finalData);
  await recordAuditEvent('UPDATE', 'Staff', `Updated staff member ${updatedStaff.firstName} ${updatedStaff.lastName}`, id);
  return { data: updatedStaff };
};

export const updateStaffStatus = async (id, status) => {
  const staff = localDb.getById(KEYS.STAFF, id);
  if (!staff) throw new Error('Staff member not found');
  if ((staff.role === 'Administrator' || staff.username === 'admin') && status !== 'Active') {
    throw new Error('Cannot deactivate Administrator account');
  }
  await new Promise(resolve => setTimeout(resolve, 300));
  const updatedStaff = localDb.update(KEYS.STAFF, id, { status });
  await recordAuditEvent('UPDATE', 'Staff', `Updated status of staff ${id} to ${status}`, id);
  return { data: updatedStaff };
};

export const deleteStaff = async (id) => {
  const staff = localDb.getById(KEYS.STAFF, id);
  if (!staff) throw new Error('Staff member not found');
  if (staff.role === 'Administrator' || staff.username === 'admin') {
    throw new Error('Cannot delete Administrator account');
  }
  await new Promise(resolve => setTimeout(resolve, 400));
  localDb.remove(KEYS.STAFF, id);
  await recordAuditEvent('DELETE', 'Staff', `Deleted staff member ${staff.firstName} ${staff.lastName}`, id);
  return { data: { id } };
};
