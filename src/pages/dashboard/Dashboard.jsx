import { useState, useEffect } from 'react';
import { 
  DollarSign, Package, ShoppingCart, AlertCircle, Clock, Users, 
  TrendingUp, CreditCard, Receipt, Building, Pill 
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { dashboardData } from '../../data/dashboard';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [dynamicKpis, setDynamicKpis] = useState(dashboardData.kpis);
  const [dynamicLowStock, setDynamicLowStock] = useState(dashboardData.lowStockAlerts);
  const [paymentMixData, setPaymentMixData] = useState([]);
  const { salesTrend } = dashboardData;
  const PIE_COLORS = ['#2482ED', '#24C9A0', '#F59E0B', '#6366F1', '#EC4899'];

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

        // Calculate Payment Mix
        const pmix = {};
        sales.forEach(s => {
          if (s.status !== 'Cancelled') {
            const method = s.paymentMethod || 'Cash';
            if (!pmix[method]) pmix[method] = 0;
            pmix[method] += (Number(s.grandTotal) || 0);
          }
        });
        const pmixArray = Object.keys(pmix).map(k => ({ name: k, value: pmix[k] })).sort((a, b) => b.value - a.value);
        setPaymentMixData(pmixArray);

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

  const greetingTime = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#162033] dark:text-white">
            {greetingTime}, {currentUser?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
            Medical Shop ERP · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Link to="/purchases/new" className="inline-flex items-center justify-center bg-white dark:bg-slate-800 border border-[#DDE6F0] dark:border-slate-600 text-[#162033] dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F5F8FC] dark:hover:bg-slate-700 shadow-sm transition-colors cursor-pointer">
            New Purchase
          </Link>
          <Link to="/billing" className="inline-flex items-center justify-center bg-[#2482ED] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1A6BC7] shadow-sm transition-colors cursor-pointer">
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
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
        {[
          { label: 'Low Stock', value: dynamicKpis.lowStock, icon: Package, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
          { label: 'Out of Stock', value: dynamicKpis.outOfStock, icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
          { label: 'Expired', value: dynamicKpis.expiredMedicines, icon: AlertCircle, color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/40' },
          { label: 'Near Expiry', value: dynamicKpis.nearExpiryMedicines, icon: Clock, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
          { label: 'Pending Pay', value: `₹${(dynamicKpis.pendingPayments / 1000).toFixed(1)}k`, icon: CreditCard, color: 'text-[#2482ED] dark:text-[#38BDF8]', bg: 'bg-[#EAF3FE] dark:bg-blue-900/30' },
          { label: 'Customers', value: dynamicKpis.customers, icon: Users, color: 'text-[#24C9A0] dark:text-[#24C9A0]', bg: 'bg-[#E6F9F5] dark:bg-emerald-900/30' },
          { label: 'Suppliers', value: dynamicKpis.suppliers, icon: Building, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
          { label: 'Total Bills', value: dynamicKpis.totalBills, icon: Receipt, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/30' },
        ].map((stat, idx) => (
          <div key={idx} className={`p-3 rounded-xl border border-[#DDE6F0] dark:border-slate-700/50 bg-white dark:bg-[#102A43] flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow`}>
            <div className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="text-lg font-bold text-[#162033] dark:text-white leading-tight">{stat.value}</div>
            <div className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
          <CardHeader>
            <CardTitle>Sales & Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e5e7eb'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748B', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748B', fontSize: 11 }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#f8fafc' : '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    formatter={(value) => `₹${value}`}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#24C9A0" strokeWidth={3} dot={{ r: 3, strokeWidth: 2, fill: theme === 'dark' ? '#1e293b' : '#ffffff' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="profit" stroke="#2482ED" strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
          <CardHeader>
            <CardTitle>Payment Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full flex items-center justify-center">
              {paymentMixData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMixData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {paymentMixData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `₹${value.toLocaleString()}`}
                      contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-[#94A3B8] text-sm">No payment data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
          <CardHeader>
            <CardTitle>AI Stock Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col h-64">
              <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
                <div className="w-12 h-12 bg-[#EAF3FE] dark:bg-blue-900/30 text-[#2482ED] dark:text-[#38BDF8] rounded-full flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#162033] dark:text-white mb-1 text-sm">Smart Forecasts</h3>
                <p className="text-[12px] text-[#64748B] dark:text-slate-400 mb-5 leading-snug">
                  Predict demand based on historical data to avoid stockouts.
                </p>
                <Link to="/analytics/predictions" className="w-full bg-[#EAF3FE] dark:bg-blue-900/20 text-[#2482ED] dark:text-[#38BDF8] font-semibold text-xs py-2 px-4 rounded-lg hover:bg-[#DDE6F0] dark:hover:bg-blue-900/40 transition-colors border border-[#DDE6F0] dark:border-blue-800">
                  View Predictions
                </Link>
                <Link to="/analytics/bi" className="w-full mt-2 bg-white dark:bg-slate-800 text-[#64748B] dark:text-slate-300 font-semibold text-xs py-2 px-4 rounded-lg hover:bg-[#F5F8FC] dark:hover:bg-slate-750 transition-colors border border-[#DDE6F0] dark:border-slate-700">
                  Business Intelligence
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Low Stock Alerts</CardTitle>
              <Link to="/inventory" className="text-xs text-[#2482ED] hover:text-[#1A6BC7] font-semibold cursor-pointer">View Inventory</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-[#F5F8FC] dark:bg-slate-900/50 border-b border-[#DDE6F0] dark:border-slate-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Medicine</th>
                    <th scope="col" className="px-6 py-3 text-left text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Current Stock</th>
                    <th scope="col" className="px-6 py-3 text-left text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Minimum</th>
                    <th scope="col" className="px-6 py-3 text-left text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#102A43] divide-y divide-[#DDE6F0] dark:divide-slate-700/50">
                  {dynamicLowStock.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400">
                        No low stock items.
                      </td>
                    </tr>
                  ) : dynamicLowStock.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F5F8FC] dark:hover:bg-slate-750/50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-[#162033] dark:text-slate-100 flex items-center">
                        <Pill className="w-4 h-4 text-[#94A3B8] dark:text-slate-500 mr-2" />
                        {item.name}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-red-600 dark:text-red-400">{item.current}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-[#64748B] dark:text-slate-400">{item.minimum}</td>
                      <td className="px-6 py-3 whitespace-nowrap">
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

        <Card className="shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Recent Invoices</CardTitle>
              <Link to="/billing/history" className="text-xs text-[#2482ED] hover:text-[#1A6BC7] font-semibold cursor-pointer">View All</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-[#F5F8FC] dark:bg-slate-900/50 border-b border-[#DDE6F0] dark:border-slate-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Invoice #</th>
                    <th scope="col" className="px-6 py-3 text-left text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3 text-left text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#102A43] divide-y divide-[#DDE6F0] dark:divide-slate-700/50">
                  {sales.slice(-5).reverse().map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#F5F8FC] dark:hover:bg-slate-750/50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-[#2482ED] dark:text-primary-400">{inv.invoiceNumber || `INV-${inv.id}`}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-[#162033] dark:text-slate-100">{inv.customerName || 'Walk-in'}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-[#162033] dark:text-slate-100">₹{(inv.grandTotal || 0).toFixed(2)}</td>
                      <td className="px-6 py-3 whitespace-nowrap">
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
