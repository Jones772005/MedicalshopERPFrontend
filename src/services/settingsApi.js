import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { recordAuditEvent } from './auditApi';

export const getSettings = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: localDb.get(KEYS.SETTINGS) });
    }, 300);
  });
};

export const updateSettings = async (category, newSettings) => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const allSettings = localDb.get(KEYS.SETTINGS) || {};
      allSettings[category] = { ...allSettings[category], ...newSettings };
      localDb.set(KEYS.SETTINGS, allSettings);
      
      await recordAuditEvent('UPDATE', 'Settings', `Updated ${category} settings`);
      
      resolve({ data: allSettings[category] });
    }, 400);
  });
};
