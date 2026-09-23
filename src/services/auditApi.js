import localDb from './localDb';
import { KEYS } from '../data/storageKeys';

export const getAuditLogs = async (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = localDb.get(KEYS.AUDIT_LOGS);
      if (filters.action) {
        filtered = filtered.filter(l => l.action === filters.action);
      }
      resolve({ data: filtered });
    }, 500);
  });
};

export const recordAuditEvent = async (action, module, details, recordId = null) => {
  console.log(`[AUDIT LOG] ${action} in ${module}: ${details} (${recordId})`);
  return new Promise((resolve) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('erp_user') || '{}');
      const logEntry = {
        action,
        module,
        details,
        recordId,
        user: currentUser.name || 'System',
        timestamp: new Date().toISOString(),
      };
      
      localDb.insert(KEYS.AUDIT_LOGS, logEntry);
      resolve({ data: { success: true } });
    } catch (e) {
      console.error('Failed to write audit log', e);
      resolve({ data: { success: false } });
    }
  });
};
