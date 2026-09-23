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

export const updateRolePermissions = async (id, permissions) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const role = localDb.update(KEYS.ROLES, id, { permissions });
  await recordAuditEvent('UPDATE', 'Roles', `Updated permissions for Role ${role.name}`, id);
  return { data: role };
};
