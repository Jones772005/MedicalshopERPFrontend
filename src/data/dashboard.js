export const dashboardData = {
  kpis: {
    // Primary
    todaySales: 12450.50,
    todayPurchases: 4200.00,
    todayProfit: 3150.25,
    availableStock: 25430,
    totalMedicines: 124,
    
    // Secondary
    lowStock: 15,
    outOfStock: 4,
    expiredMedicines: 2,
    nearExpiryMedicines: 8,
    pendingPayments: 4500.00,
    customers: 850,
    suppliers: 24,
    totalBills: 142
  },
  salesTrend: [
    { name: 'Mon', sales: 4000, profit: 2400 },
    { name: 'Tue', sales: 3000, profit: 1398 },
    { name: 'Wed', sales: 2000, profit: 1800 },
    { name: 'Thu', sales: 2780, profit: 1908 },
    { name: 'Fri', sales: 4890, profit: 2800 },
    { name: 'Sat', sales: 5390, profit: 3800 },
    { name: 'Sun', sales: 3490, profit: 2300 },
  ],
  topMedicines: [
    { id: 1, name: 'Paracetamol 500mg', sales: 145 },
    { id: 2, name: 'Amoxicillin 250mg', sales: 98 },
    { id: 3, name: 'Cetirizine 10mg', sales: 85 },
    { id: 4, name: 'Omeprazole 20mg', sales: 72 },
    { id: 5, name: 'Azithromycin 500mg', sales: 65 },
  ],
  lowStockAlerts: [
    { id: 101, name: 'Aspirin 75mg', current: 15, minimum: 50 },
    { id: 102, name: 'Ibuprofen 400mg', current: 8, minimum: 30 },
    { id: 103, name: 'Vitamin C 1000mg', current: 5, minimum: 40 },
  ]
};
