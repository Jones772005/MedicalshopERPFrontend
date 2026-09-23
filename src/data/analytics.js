// Mock analytics data for Business Intelligence Dashboard

export const analyticsData = {
  salesPerformance: {
    totalRevenue: 245000,
    totalSales: 1250,
    averageBillValue: 196,
    monthlyGrowth: 12.5,
    revenueTrend: [
      { name: 'Week 1', revenue: 45000 },
      { name: 'Week 2', revenue: 52000 },
      { name: 'Week 3', revenue: 68000 },
      { name: 'Week 4', revenue: 80000 },
    ],
    categorySales: [
      { name: 'Antibiotics', value: 35 },
      { name: 'Painkillers', value: 25 },
      { name: 'Vitamins', value: 20 },
      { name: 'First Aid', value: 10 },
      { name: 'Others', value: 10 },
    ]
  },
  productPerformance: {
    topSelling: [
      { id: 1, name: 'Amoxicillin 500mg', soldQuantity: 1200, revenue: 120000 },
      { id: 3, name: 'Paracetamol 500mg', soldQuantity: 2500, revenue: 75000 },
      { id: 11, name: 'Omeprazole 20mg', soldQuantity: 800, revenue: 48000 },
    ]
  },
  customerPerformance: {
    totalCustomers: 850,
    newCustomers: 120,
    returningCustomers: 730,
    retentionRate: 85.8,
    customerGrowth: [
      { name: 'Jan', new: 40, returning: 300 },
      { name: 'Feb', new: 60, returning: 320 },
      { name: 'Mar', new: 80, returning: 350 },
      { name: 'Apr', new: 120, returning: 400 },
    ]
  },
  supplierPerformance: {
    topSuppliers: [
      { id: 1, name: 'MedLife Distributors', purchaseVolume: 450000 },
      { id: 2, name: 'PharmaCore India', purchaseVolume: 320000 },
    ]
  },
  inventoryPerformance: {
    inventoryValue: 850000,
    inventoryTurnover: 4.2,
    lowStockCount: 12,
    expiredStockValue: 12500,
    nearExpiryStockValue: 45000
  }
};

export const stockPredictionsData = {
  1: {
    medicineId: 1,
    name: "Amoxicillin 500mg",
    currentStock: 150,
    averageDailySales: 25,
    forecastDemand: 800, // next 30 days
    recommendedStock: 1000,
    riskLevel: "High", // High risk of stock out
    historicalDemand: [
      { day: 'Day 1', sales: 20, forecast: null },
      { day: 'Day 2', sales: 25, forecast: null },
      { day: 'Day 3', sales: 22, forecast: null },
      { day: 'Day 4', sales: null, forecast: 26 },
      { day: 'Day 5', sales: null, forecast: 28 },
    ]
  },
  3: {
    medicineId: 3,
    name: "Paracetamol 500mg",
    currentStock: 5000,
    averageDailySales: 100,
    forecastDemand: 3000, // next 30 days
    recommendedStock: 3500,
    riskLevel: "Low", // sufficient stock
    historicalDemand: [
      { day: 'Day 1', sales: 90, forecast: null },
      { day: 'Day 2', sales: 110, forecast: null },
      { day: 'Day 3', sales: 105, forecast: null },
      { day: 'Day 4', sales: null, forecast: 95 },
      { day: 'Day 5', sales: null, forecast: 100 },
    ]
  }
};
