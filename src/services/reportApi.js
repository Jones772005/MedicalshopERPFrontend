import { getSales } from './salesApi';
import { getPurchases } from './purchaseApi';
import { getInventory } from './inventoryApi';

export const getReports = async (type, filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        let data = [];
        
        switch (type) {
          case 'sales':
            const salesRes = await getSales();
            data = salesRes.data;
            break;
          case 'purchases':
            const purRes = await getPurchases();
            data = purRes.data;
            break;
          case 'inventory':
            const invRes = await getInventory();
            data = invRes.data;
            break;
          default:
            data = [];
        }

        // Apply basic mock filtering (very rudimentary for demonstration)
        if (filters.startDate) {
          data = data.filter(item => new Date(item.date || item.orderDate) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
          data = data.filter(item => new Date(item.date || item.orderDate) <= new Date(filters.endDate));
        }

        resolve({ data });
      } catch (err) {
        resolve({ data: [] });
      }
    }, 500);
  });
};
