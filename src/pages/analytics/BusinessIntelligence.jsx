import { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { TrendingUp, Users, Package, ShoppingCart, Activity } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAnalytics } from '../../services/analyticsApi';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
      {trend && (
        <p className="text-sm mt-1 text-green-600 dark:text-green-400 flex items-center">
          <TrendingUp className="w-3 h-3 mr-1" /> {trend}% vs last month
        </p>
      )}
    </div>
    <div className="p-3 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg">
      {icon}
    </div>
  </div>
);

const BusinessIntelligence = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAnalytics();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div>Failed to load BI data.</div>;

  const { salesPerformance, customerPerformance, inventoryPerformance, productPerformance } = data;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Business Intelligence" 
        description="High-level analytics covering sales, products, customers, and inventory."
      />

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`₹${salesPerformance.totalRevenue.toLocaleString()}`} 
          icon={<Activity className="w-6 h-6" />}
          trend={salesPerformance.monthlyGrowth}
        />
        <StatCard 
          title="Total Sales" 
          value={salesPerformance.totalSales} 
          icon={<ShoppingCart className="w-6 h-6" />}
        />
        <StatCard 
          title="Total Customers" 
          value={customerPerformance.totalCustomers} 
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard 
          title="Inventory Value" 
          value={`₹${inventoryPerformance.inventoryValue.toLocaleString()}`} 
          icon={<Package className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Trend Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesPerformance.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px'}} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Sales Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Sales by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={salesPerformance.categorySales}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {salesPerformance.categorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px'}} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Growth Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Customer Growth</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerPerformance.customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px'}} />
                <Legend />
                <Bar dataKey="new" name="New Customers" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returning" name="Returning Customers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Selling Medicines</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Qty Sold</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {productPerformance.topSelling.map(product => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400 text-right">{product.soldQuantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary-600 dark:text-primary-400 text-right">₹{product.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BusinessIntelligence;
