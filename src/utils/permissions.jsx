/* eslint-disable react/only-export-components */
import { useAuth } from '../context/AuthContext';
import localDb from '../services/localDb';
import { KEYS } from '../data/storageKeys';
import { migratePermissions, FULL_ACCESS_PERMISSIONS } from '../data/screenPermissions';

/**
 * Resolve a user's current permissions from localDb (live roles).
 * Falls back gracefully if localDb has no matching role.
 *
 * Returns a flat object: { "screen.action": boolean } — the new screen-based format.
 * Automatically migrates any old nested-format role found in localStorage.
 */
// eslint-disable-next-line react/only-export-components
export const getUserPermissions = (user) => {
  if (!user || !user.role) return null;

  // Administrator always has full access — no localStorage check needed
  if (user.role === 'Administrator') return FULL_ACCESS_PERMISSIONS;

  const roles = localDb.get(KEYS.ROLES) || [];
  const role = roles.find(r => r.name === user.role);
  if (!role) return null;

  // Migrate on read: if the stored permissions are still in old nested format,
  // convert them transparently without modifying localStorage here.
  const perms = role.permissions;
  if (!perms) return null;

  const sampleKey = Object.keys(perms)[0];
  if (sampleKey && typeof perms[sampleKey] === 'object') {
    // Old nested format — migrate on the fly
    return migratePermissions(perms);
  }

  // Already flat format — ensure all keys exist (new screens added later)
  return migratePermissions(perms);
};

/**
 * Check if a user has a specific permission.
 *
 * permissionString is a flat key like "medicines.view" or "sales-history.print".
 * Supports both new flat format AND old nested format via migratePermissions.
 * Administrator always returns true.
 */
// eslint-disable-next-line react/only-export-components
export const hasPermission = (user, permissionString) => {
  if (!user) return false;
  if (user.role === 'Administrator') return true;

  const permissions = getUserPermissions(user);
  if (!permissions) return false;

  // New flat lookup (primary path)
  if (permissions[permissionString] !== undefined) {
    return !!permissions[permissionString];
  }

  // Legacy nested lookup (backward compat for any remaining old-format data)
  const [module, action] = permissionString.split('.');
  if (permissions[module] && typeof permissions[module] === 'object' && permissions[module][action] !== undefined) {
    return !!permissions[module][action];
  }

  return false;
};

// eslint-disable-next-line react/only-export-components
export const hasAnyPermission = (user, permissionStrings) => {
  if (!user) return false;
  if (user.role === 'Administrator') return true;
  return permissionStrings.some(p => hasPermission(user, p));
};

// eslint-disable-next-line react/only-export-components
export const hasAllPermissions = (user, permissionStrings) => {
  if (!user) return false;
  if (user.role === 'Administrator') return true;
  return permissionStrings.every(p => hasPermission(user, p));
};

/**
 * Reusable component to conditionally render UI based on screen permissions.
 * API unchanged — still accepts permission (string) or permissions (array).
 */
export const PermissionGuard = ({ permission, permissions = [], requireAll = false, children, fallback = null }) => {
  const { currentUser } = useAuth();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(currentUser, permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(currentUser, permissions)
      : hasAnyPermission(currentUser, permissions);
  }

  if (hasAccess) {
    return children;
  }

  return fallback;
};
