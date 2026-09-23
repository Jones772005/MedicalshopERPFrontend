import { KEYS } from '../data/storageKeys';
import { recordAuditEvent } from './auditApi';

export const createBackup = async () => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      // Collect all keys
      const backupData = {};
      for (const key of Object.values(KEYS)) {
        const data = localStorage.getItem(key);
        if (data) {
          backupData[key] = JSON.parse(data);
        }
      }
      
      const backupBlob = {
        version: backupData[KEYS.VERSION],
        exportedAt: new Date().toISOString(),
        application: 'MedicalShopERP',
        data: backupData
      };

      const jsonStr = JSON.stringify(backupBlob, null, 2);
      const sizeMB = (new Blob([jsonStr]).size / (1024 * 1024)).toFixed(2);
      
      // We return the raw string to the component so it can trigger a download
      
      await recordAuditEvent('EXPORT', 'System', `Database backup created (${sizeMB} MB)`);
      
      resolve({ 
        data: { 
          success: true, 
          filename: `medishop-backup-${new Date().toISOString().split('T')[0]}.json`,
          size: `${sizeMB} MB`,
          timestamp: new Date().toISOString(),
          content: jsonStr
        } 
      });
    }, 1000);
  });
};

export const restoreBackup = async (fileContent) => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const backupBlob = JSON.parse(fileContent);
        
        if (backupBlob.application !== 'MedicalShopERP' || !backupBlob.data) {
          throw new Error('Invalid backup file format');
        }

        // Restore keys
        for (const [key, value] of Object.entries(backupBlob.data)) {
          localStorage.setItem(key, JSON.stringify(value));
        }

        // Emit change so app can reload or just prompt user to refresh
        window.dispatchEvent(new CustomEvent('medishop-db-change', { detail: { key: 'ALL' } }));

        await recordAuditEvent('IMPORT', 'System', `Database backup restored`);
        resolve({ data: { success: true } });
      } catch (e) {
        console.error('Failed to restore backup', e);
        reject(new Error('Failed to restore backup: ' + e.message));
      }
    }, 1500);
  });
};
