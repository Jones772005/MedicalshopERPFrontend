import localDb from './localDb';
import { KEYS } from '../data/storageKeys';

export const getAnalytics = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const sales = localDb.get(KEYS.SALES);
        const purchases = localDb.get(KEYS.PURCHASES);
        const inventory = localDb.get(KEYS.INVENTORY);

        const totalRevenue = sales.reduce((acc, s) => acc + (s.total || s.netAmount || 0), 0);
        const _totalPurchases = purchases.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
        
        // Sum total items sold
        let totalItemsSold = 0;
        sales.forEach(s => {
          if (s.items) {
            totalItemsSold += s.items.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
          }
        });

        // Current Stock Value
        const _currentStockValue = inventory.reduce((acc, i) => acc + (Number(i.quantity || 0) * Number(i.purchasePrice || 0)), 0);

        // Group sales by month for chart
        const monthlyRevenue = {};
        sales.forEach(s => {
          const date = new Date(s.date);
          const month = date.toLocaleString('default', { month: 'short' });
          monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (s.total || s.netAmount || 0);
        });

        const revenueChartData = Object.keys(monthlyRevenue).map(name => ({
          name,
          revenue: monthlyRevenue[name],
          target: monthlyRevenue[name] * 1.1 // Dummy target
        }));

        resolve({
          data: {
            overview: {
              totalRevenue,
              revenueGrowth: '+5.2%',
              totalOrders: sales.length,
              ordersGrowth: '+2.1%',
              averageOrderValue: sales.length ? totalRevenue / sales.length : 0,
              aovGrowth: '+1.5%',
              totalCustomers: new Set(sales.map(s => s.customerId)).size,
              customersGrowth: '+8.4%'
            },
            revenueChart: revenueChartData.length ? revenueChartData : [
              { name: 'Jan', revenue: 0, target: 1000 }
            ],
            topSelling: [] // Compute top selling medicines if needed
          }
        });
      } catch (e) {
        console.error('Failed to compute analytics', e);
        resolve({ data: null });
      }
    }, 400);
  });
};

export const getStockPredictions = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const inventory = localDb.get(KEYS.INVENTORY);
      const predictions = inventory.map(item => ({
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        currentStock: item.quantity,
        predictedRunoutDays: item.quantity > 0 ? Math.floor(item.quantity / 2) : 0, // Mock calculation
        recommendedOrder: item.quantity < 50 ? 500 : 0,
        confidence: 85,
        trend: item.quantity < 50 ? 'down' : 'stable'
      }));
      resolve({ data: predictions });
    }, 400);
  });
};

export const getStockPredictionForMedicine = async (medicineId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const inventory = localDb.get(KEYS.INVENTORY);
      const item = inventory.find(i => i.medicineId === medicineId);
      if (item) {
        resolve({
          data: {
            medicineId: item.medicineId,
            medicineName: item.medicineName,
            currentStock: item.quantity,
            predictedRunoutDays: item.quantity > 0 ? Math.floor(item.quantity / 2) : 0,
            recommendedOrder: item.quantity < 50 ? 500 : 0,
            confidence: 85,
            trend: item.quantity < 50 ? 'down' : 'stable'
          }
        });
      } else {
        resolve({ data: null });
      }
    }, 300);
  });
};
