import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { recordAuditEvent } from './auditApi';

export const getRoles = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: localDb.get(KEYS.ROLES) };
};

export const getRoleById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const role = localDb.getById(KEYS.ROLES, id);
  if (!role) throw new Error('Role not found');
  return { data: role };
};

export const createRole = async (roleData) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const newRole = localDb.insert(KEYS.ROLES, {
    ...roleData,
    userCount: 0,
  });
  await recordAuditEvent('CREATE', 'Roles', `Created role ${newRole.name}`, newRole.id);
  return { data: newRole };
};

export const deleteRole = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const role = localDb.getById(KEYS.ROLES, id);
  if (!role) throw new Error('Role not found');
  // Block deletion of the built-in Administrator role
  if (role.name === 'Administrator') {
    throw new Error('The Administrator role is a protected system role and cannot be deleted.');
  }
  // Block deletion if any staff member is currently assigned this role
  const allStaff = localDb.get(KEYS.STAFF);
  const assignedStaff = allStaff.filter(s => s.role === role.name || s.roleId === id);
  if (assignedStaff.length > 0) {
    throw new Error(`Cannot delete "${role.name}" — it is currently assigned to ${assignedStaff.length} staff member(s). Reassign them before deleting this role.`);
  }
  localDb.remove(KEYS.ROLES, id);
  await recordAuditEvent('DELETE', 'Roles', `Deleted role ${role.name}`, id);
  return { data: { id } };
};


export const updateRolePermissions = async (id, permissions) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const role = localDb.update(KEYS.ROLES, id, { permissions });
  await recordAuditEvent('UPDATE', 'Roles', `Updated permissions for Role ${role.name}`, id);
  return { data: role };
};
