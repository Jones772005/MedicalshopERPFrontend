import { useState, useEffect } from 'react';
import { 
  DollarSign, Package, ShoppingCart, AlertCircle, Clock, Users, 
  TrendingUp, CreditCard, Receipt, Building, Pill 
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { dashboardData } from '../../data/dashboard';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { getSales } from '../../services/salesApi';
import { getPurchases } from '../../services/purchaseApi';
import { 
  getInventory, 
  getLowStockItems, 
  getOutOfStockItems, 
  getExpiredItems, 
  getNearExpiryItems 
} from '../../services/inventoryApi';
import { getMedicines } from '../../services/medicineApi';
import { getCustomers } from '../../services/customerApi';
import { getSuppliers } from '../../services/supplierApi';
import { calculateProfit } from '../../utils/financialCalculations';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [dynamicKpis, setDynamicKpis] = useState(dashboardData.kpis);
  const [dynamicLowStock, setDynamicLowStock] = useState(dashboardData.lowStockAlerts);
  const { salesTrend } = dashboardData;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [salesRes, purRes, invRes, medRes, custRes, suppRes] = await Promise.all([
          getSales(),
          getPurchases(),
          getInventory(),
          getMedicines(),
          getCustomers(),
          getSuppliers()
        ]);
        
        const sales = salesRes.data;
        const purchases = purRes.data;
        const inventory = invRes.data;
        const medicines = medRes.data;
        const customersList = custRes.data;
        const suppliersList = suppRes.data;

        setSales(sales);

        // Use local date for "Today" comparisons (YYYY-MM-DD)
        const todayDateObj = new Date();
        const todayStr = todayDateObj.toLocaleDateString('en-CA');
        
        const isToday = (isoString) => {
          if (!isoString) return false;
          return new Date(isoString).toLocaleDateString('en-CA') === todayStr;
        };

        const todaySalesList = sales.filter(s => isToday(s.date) && s.status !== 'Cancelled');
        const todaySales = todaySalesList.reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0);
          
        const todayPurchases = purchases
          .filter(p => isToday(p.orderDate) && p.status !== 'Cancelled')
          .reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);

        // Available stock is simply the sum of all item quantities (matches Inventory Current Stock definition)
        const availableStock = inventory.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

        // Use canonical shared helpers for inventory metrics
        const lowStockItems = getLowStockItems(inventory);
        const outOfStockItems = getOutOfStockItems(inventory);
        const expiredItems = getExpiredItems(inventory);
        const nearExpiryItems = getNearExpiryItems(inventory);

        // Build low stock array grouped by medicine for the table (just taking top 5)
        const medMinStockMap = {};
        medicines.forEach(m => { medMinStockMap[m.id] = Number(m.minimumStockLevel); });
        
        const stockByMedicine = {};
        lowStockItems.forEach(i => {
          const medId = i.medicineId;
          if (!stockByMedicine[medId]) {
            stockByMedicine[medId] = { medicineId: medId, name: i.medicineName || i.name || 'Unknown', total: 0 };
          }
          stockByMedicine[medId].total += Number(i.quantity) || 0;
        });
        const lowStockTableData = Object.values(stockByMedicine).slice(0, 5);

        // Calculate today's profit
        const todayProfit = calculateProfit(todaySalesList, inventory);

        // Calculate pending payments to suppliers
        const pendingPayments = suppliersList.reduce((sum, s) => sum + (Number(s.outstandingAmount) || 0), 0);

        setDynamicKpis(prev => ({
          ...prev,
          todaySales,
          todayPurchases,
          todayProfit,
          availableStock,
          lowStock: lowStockItems.length,
          outOfStock: outOfStockItems.length,
          expiredMedicines: expiredItems.length,
          nearExpiryMedicines: nearExpiryItems.length,
          totalBills: sales.filter(s => s.status !== 'Cancelled').length,
          customers: customersList.length,
          suppliers: suppliersList.length,
          pendingPayments
        }));
        
        setDynamicLowStock(lowStockTableData.map(item => ({
          id: item.medicineId,
          name: item.name,
          current: item.total,
          minimum: medMinStockMap[item.medicineId] !== undefined && !isNaN(medMinStockMap[item.medicineId]) ? medMinStockMap[item.medicineId] : 0
        })));

      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Medical Shop ERP performance overview.</p>
        </div>
        <div className="mt-4 sm:mt-0 space-x-3">
          <Link to="/purchases/new" className="inline-block bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-colors cursor-pointer">
            New Purchase
          </Link>
          <Link to="/billing" className="inline-block bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors cursor-pointer">
            New POS Bill
          </Link>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Sales" 
          value={`₹${dynamicKpis.todaySales.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue="12.5%"
          color="success"
        />
        <StatCard 
          title="Today's Purchases" 
          value={`₹${dynamicKpis.todayPurchases.toLocaleString()}`}
          icon={ShoppingCart}
          trend="down"
          trendValue="2.4%"
          color="warning"
        />
        <StatCard 
          title="Today's Profit" 
          value={`₹${dynamicKpis.todayProfit.toLocaleString()}`}
          icon={TrendingUp}
          trend="up"
          trendValue="5.2%"
          color="primary"
        />
        <StatCard 
          title="Available Stock" 
          value={dynamicKpis.availableStock.toLocaleString()}
          icon={Package}
          color="info"
        />
      </div>

      {/* Secondary Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
        {[
          { label: 'Low Stock', value: dynamicKpis.lowStock, icon: Package, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
          { label: 'Out of Stock', value: dynamicKpis.outOfStock, icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
          { label: 'Expired', value: dynamicKpis.expiredMedicines, icon: AlertCircle, color: 'text-red-800 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/40' },
          { label: 'Near Expiry', value: dynamicKpis.nearExpiryMedicines, icon: Clock, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
          { label: 'Pending Pay', value: `₹${(dynamicKpis.pendingPayments / 1000).toFixed(1)}k`, icon: CreditCard, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
          { label: 'Customers', value: dynamicKpis.customers, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
          { label: 'Suppliers', value: dynamicKpis.suppliers, icon: Building, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
          { label: 'Total Bills', value: dynamicKpis.totalBills, icon: Receipt, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/30' },
        ].map((stat, idx) => (
          <div key={idx} className={`p-3 rounded-lg border border-gray-100 dark:border-slate-700/50 ${stat.bg} flex flex-col items-center justify-center text-center`}>
            <stat.icon className={`w-5 h-5 mb-1 ${stat.color}`} />
            <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales & Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e5e7eb'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#6b7280', fontSize: 12 }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#f8fafc' : '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    formatter={(value) => `₹${value}`}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: theme === 'dark' ? '#1e293b' : '#ffffff' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>AI Stock Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col h-80">
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Smart Forecasts</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                  Predict demand based on historical data to avoid stockouts.
                </p>
                <Link to="/analytics/predictions" className="w-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium py-2 px-4 rounded hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors border border-primary-200 dark:border-primary-800">
                  View Predictions
                </Link>
                <Link to="/analytics/bi" className="w-full mt-3 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 font-medium py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-slate-750 transition-colors border border-gray-200 dark:border-slate-700">
                  Business Intelligence
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Low Stock Alerts</CardTitle>
              <Link to="/inventory" className="text-sm text-primary-600 hover:text-primary-700 font-medium cursor-pointer">View Inventory</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Medicine</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Current Stock</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Minimum</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {dynamicLowStock.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400">
                        No low stock items.
                      </td>
                    </tr>
                  ) : dynamicLowStock.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-750/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100 flex items-center">
                        <Pill className="w-4 h-4 text-gray-400 dark:text-slate-500 mr-2" />
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 dark:text-red-400">{item.current}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{item.minimum}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400">
                          Critical
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Recent Invoices</CardTitle>
              <Link to="/billing/history" className="text-sm text-primary-600 hover:text-primary-700 font-medium cursor-pointer">View All</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Invoice #</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {sales.slice(-5).reverse().map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-slate-750/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600 dark:text-primary-400">{inv.invoiceNumber || `INV-${inv.id}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">{inv.customerName || 'Walk-in'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">₹{(inv.grandTotal || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          inv.paymentStatus === 'Paid' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400'
                        }`}>
                          {inv.paymentStatus || 'Paid'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
