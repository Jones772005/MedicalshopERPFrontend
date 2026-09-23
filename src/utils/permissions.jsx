import { useAuth } from '../context/AuthContext';
import { mockRoles } from '../data/roles';

// Helper to get active user's permissions based on their role
// In a real app, permissions might come attached to the user object upon login
// eslint-disable-next-line react/only-export-components
export const getUserPermissions = (user) => {
  if (!user || !user.role) return null;
  const role = mockRoles.find(r => r.name === user.role);
  return role ? role.permissions : null;
};

// Check if user has a specific permission (e.g., 'inventory.adjust')
// eslint-disable-next-line react/only-export-components
export const hasPermission = (user, permissionString) => {
  if (!user) return false;
  
  // Admin bypass
  if (user.role === 'Administrator') return true;

  const permissions = getUserPermissions(user);
  if (!permissions) return false;

  const [module, action] = permissionString.split('.');
  
  if (permissions[module] && permissions[module][action] !== undefined) {
    return permissions[module][action];
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

// Reusable component to conditionally render UI based on permissions
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
