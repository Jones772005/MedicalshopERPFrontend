/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { loginApi } from '../services/authApi';
import localDb from '../services/localDb';
import { KEYS } from '../data/storageKeys';
import { recordAuditEvent } from '../services/auditApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const updateUserState = (user) => {
    setCurrentUser(user);
    if (user && user.role) {
      const roles = localDb.get(KEYS.ROLES) || [];
      const role = roles.find(r => r.name === user.role);
      setCurrentRole(role || null);
      setPermissions(role ? role.permissions : null);
    } else {
      setCurrentRole(null);
      setPermissions(null);
    }
  };

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('erp_token');
      const userStr = localStorage.getItem('erp_user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          updateUserState(user);
          setIsAuthenticated(true);
        } catch (e) {
          console.error("Failed to parse user data", e);
          localStorage.removeItem('erp_token');
          localStorage.removeItem('erp_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await loginApi({ email, password });
    const { user, token } = response.data;
    
    localStorage.setItem('erp_token', token);
    localStorage.setItem('erp_user', JSON.stringify(user));
    
    updateUserState(user);
    setIsAuthenticated(true);
    
    // Log audit event
    recordAuditEvent('LOGIN', 'Authentication', `User ${user.name} logged in`);
    
    return user;
  };

  const logout = () => {
    if (currentUser) {
      recordAuditEvent('LOGOUT', 'Authentication', `User ${currentUser.name} logged out`);
    }
    
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    updateUserState(null);
    setIsAuthenticated(false);
  };

  const switchDemoUser = (email) => {
    const users = localDb.get(KEYS.USERS) || [];
    const user = users.find(u => u.email === email);
    if (user) {
      const token = 'mock-jwt-token-' + user.id;
      localStorage.setItem('erp_token', token);
      localStorage.setItem('erp_user', JSON.stringify(user));
      
      updateUserState(user);
      setIsAuthenticated(true);
      
      recordAuditEvent('DEMO_USER_SWITCH', 'System', `Demo switched to ${user.name} (${user.role})`);
      return user;
    }
    throw new Error("Demo user not found");
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      currentRole, 
      permissions, 
      isAuthenticated, 
      loading, 
      login, 
      logout,
      switchDemoUser
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
