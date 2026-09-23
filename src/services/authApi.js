import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { recordAuditEvent } from './auditApi';

export const loginApi = async (credentials) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const users = localDb.get(KEYS.USERS);
  const user = users.find(u => u.email === credentials.email);
  
  // Real check against password
  if (!user || credentials.password !== user.password) {
    const error = new Error('Invalid email or password');
    error.response = { data: { message: 'Invalid email or password' } };
    throw error;
  }
  
  // Exclude password from the returned object for security
  const { password: _password, ...userWithoutPassword } = user;
  
  const token = 'mock-jwt-token-' + user.id;
  
  // We can't log here directly via recordAuditEvent since local storage user may not be set yet.
  // Actually, setting user in localStorage happens in AuthContext immediately after this returns.
  // We'll log it asynchronously without waiting.
  setTimeout(() => {
    recordAuditEvent('LOGIN', 'Auth', `User logged in: ${user.email}`, user.id).catch(e => console.error(e));
  }, 100);

  return { data: { user: userWithoutPassword, token } };
};
