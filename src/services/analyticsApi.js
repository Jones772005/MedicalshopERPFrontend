import localDb from './localDb';
import { KEYS } from '../data/storageKeys';

export const getAnalytics = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const sales = localDb.get(KEYS.SALES) || [];
        const customers = localDb.get(KEYS.CUSTOMERS) || [];
        const inventory = localDb.get(KEYS.INVENTORY) || [];
        const medicines = localDb.get(KEYS.MEDICINES) || [];

        const totalRevenue = sales.reduce((acc, s) => acc + (Number(s.grandTotal || s.total || s.netAmount || 0)), 0);
        const totalSales = sales.filter(s => s.status !== 'Cancelled').length;

        // Group sales by month for chart
        const monthlyRevenue = {};
        sales.forEach(s => {
          if (s.status !== 'Cancelled' && s.date) {
            const date = new Date(s.date);
            const month = date.toLocaleString('default', { month: 'short' });
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (Number(s.grandTotal || s.total || s.netAmount || 0));
          }
        });

        const revenueTrend = Object.keys(monthlyRevenue).map(name => ({
          name,
          revenue: monthlyRevenue[name]
        }));

        // Category Sales
        const medCatMap = {};
        medicines.forEach(m => { medCatMap[m.id] = m.category || 'General'; });

        const categoryMap = {};
        sales.forEach(s => {
          if (s.status !== 'Cancelled' && Array.isArray(s.items)) {
            s.items.forEach(it => {
              const cat = medCatMap[it.medicineId] || it.category || 'General';
              categoryMap[cat] = (categoryMap[cat] || 0) + Number(it.amount || it.total || (it.quantity * it.rate) || 0);
            });
          }
        });
        const categorySales = Object.keys(categoryMap).map(name => ({
          name,
          value: categoryMap[name]
        }));

        // Customer Growth
        const customerMonthMap = {};
        customers.forEach(c => {
          if (c.createdAt || c.lastPurchaseDate) {
            const d = new Date(c.createdAt || c.lastPurchaseDate);
            const month = d.toLocaleString('default', { month: 'short' });
            if (!customerMonthMap[month]) customerMonthMap[month] = { name: month, new: 0, returning: 0 };
            customerMonthMap[month].new += 1;
          }
        });
        const customerGrowth = Object.values(customerMonthMap);

        // Top Selling Products
        const productSalesMap = {};
        sales.forEach(s => {
          if (s.status !== 'Cancelled' && Array.isArray(s.items)) {
            s.items.forEach(it => {
              const id = it.medicineId || it.id || 'Unknown';
              if (!productSalesMap[id]) {
                productSalesMap[id] = {
                  id,
                  name: it.medicineName || it.name || `Medicine #${id}`,
                  soldQuantity: 0,
                  revenue: 0
                };
              }
              productSalesMap[id].soldQuantity += Number(it.quantity || 0);
              productSalesMap[id].revenue += Number(it.amount || it.total || (it.quantity * (it.rate || 0)) || 0);
            });
          }
        });
        const topSelling = Object.values(productSalesMap).sort((a, b) => b.soldQuantity - a.soldQuantity).slice(0, 5);

        // Current Stock Value
        const inventoryValue = inventory.reduce((acc, i) => acc + (Number(i.quantity || 0) * Number(i.purchasePrice || 0)), 0);

        resolve({
          data: {
            salesPerformance: {
              totalRevenue,
              totalSales,
              monthlyGrowth: 0,
              revenueTrend,
              categorySales
            },
            customerPerformance: {
              totalCustomers: customers.length,
              customerGrowth
            },
            inventoryPerformance: {
              inventoryValue
            },
            productPerformance: {
              topSelling
            }
          }
        });
      } catch (e) {
        console.error('Failed to compute analytics', e);
        resolve({ data: null });
      }
    }, 200);
  });
};

export const getStockPredictions = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const inventory = localDb.get(KEYS.INVENTORY) || [];
      const predictions = inventory.map(item => ({
        medicineId: item.medicineId || item.id,
        medicineName: item.medicineName || item.name || 'Unknown',
        currentStock: Number(item.quantity) || 0,
        predictedRunoutDays: Number(item.quantity) > 0 ? Math.floor(Number(item.quantity) / 2) : 0,
        recommendedOrder: Number(item.quantity) < 50 ? 500 : 0,
        confidence: 85,
        trend: Number(item.quantity) < 50 ? 'down' : 'stable'
      }));
      resolve({ data: predictions });
    }, 200);
  });
};

export const getStockPredictionForMedicine = async (medicineId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const inventory = localDb.get(KEYS.INVENTORY) || [];
      const item = inventory.find(i => (i.medicineId === medicineId || i.id === medicineId));
      if (item) {
        resolve({
          data: {
            medicineId: item.medicineId || item.id,
            medicineName: item.medicineName || item.name || 'Unknown',
            currentStock: Number(item.quantity) || 0,
            predictedRunoutDays: Number(item.quantity) > 0 ? Math.floor(Number(item.quantity) / 2) : 0,
            recommendedOrder: Number(item.quantity) < 50 ? 500 : 0,
            confidence: 85,
            trend: Number(item.quantity) < 50 ? 'down' : 'stable'
          }
        });
      } else {
        resolve({ data: null });
      }
    }, 200);
  });
};
