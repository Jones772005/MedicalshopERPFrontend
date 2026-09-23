import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { getMedicines } from './medicineApi';
import { getInventory } from './inventoryApi';

export const getAlternativeMedicines = async (medicineId) => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const altData = localDb.get(KEYS.ALTERNATIVES) || {};
        const altIds = altData[medicineId] || [];
        if (altIds.length === 0) {
          resolve({ data: [] });
          return;
        }

        const [medRes, invRes] = await Promise.all([getMedicines(), getInventory()]);
        const allMedicines = medRes.data;
        const inventory = invRes.data;

        const alternatives = altIds.map(id => {
          const med = allMedicines.find(m => m.id === id);
          if (!med) return null;
          
          // Calculate stock by summing batch quantities
          const stock = inventory
            .filter(inv => inv.medicineId === id)
            .reduce((acc, curr) => acc + (curr.quantity || 0), 0);

          return {
            ...med,
            availableQuantity: stock
          };
        }).filter(Boolean);

        resolve({ data: alternatives });
      } catch (e) {
        console.error('Failed to get alternatives', e);
        resolve({ data: [] });
      }
    }, 400);
  });
};
