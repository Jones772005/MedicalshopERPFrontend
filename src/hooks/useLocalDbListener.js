import { useEffect } from 'react';

/**
 * Hook to listen for database changes on a specific key (or 'ALL')
 * and trigger a callback to refresh data.
 * 
 * @param {string} key - The storage key to listen for (e.g., KEYS.INVENTORY, or 'ALL')
 * @param {Function} callback - The function to execute when a change occurs
 */
export const useLocalDbListener = (key, callback) => {
  useEffect(() => {
    const handleDbChange = (event) => {
      if (event.detail.key === key || event.detail.key === 'ALL') {
        callback();
      }
    };

    window.addEventListener('medishop-db-change', handleDbChange);

    return () => {
      window.removeEventListener('medishop-db-change', handleDbChange);
    };
  }, [key, callback]);
};
