import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReportFilterBar from '../../components/reports/ReportFilterBar';
import StatCard from '../../components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { getSales } from '../../services/salesApi';
import { getPurchases } from '../../services/purchaseApi';
import { getInventory } from '../../services/inventoryApi';
import { calculateProfit, calculateCOGS } from '../../utils/financialCalculations';

const FinancialReport = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({ revenue: 0, expenses: 0, profit: 0 });
  const [allSales, setAllSales] = useState([]);
  const [allInventory, setAllInventory] = useState([]);
  const [dataReady, setDataReady] = useState(false);

  const computeReport = (sales, inventory, filters = {}) => {
    const { startDate, endDate } = filters;
    let filteredSales = sales.filter(s => s.status !== 'Cancelled');
    if (startDate) filteredSales = filteredSales.filter(s => (s.date || s.createdAt) >= startDate);
    if (endDate) filteredSales = filteredSales.filter(s => (s.date || s.createdAt) <= endDate + 'T23:59:59');

    let totalRevenue = 0;
    const monthlyData = {};
    
    filteredSales.forEach(sale => {
      const dateObj = new Date(sale.date || sale.createdAt);
      const month = dateObj.toLocaleString('default', { month: 'short' });
      const year = dateObj.getFullYear();
      const key = `${month} ${year}`;
      if (!monthlyData[key]) monthlyData[key] = { month: key, revenue: 0, expenses: 0, profit: 0 };
      const rev = (sale.subtotal || 0) - (sale.discount || 0);
      const cogs = calculateCOGS(sale.items, inventory);
      monthlyData[key].revenue += rev;
      monthlyData[key].expenses += cogs;
      monthlyData[key].profit += (rev - cogs);
      totalRevenue += rev;
    });

    const sortedMonths = Object.values(monthlyData).sort((a, b) => new Date(a.month) - new Date(b.month));
    setChartData(sortedMonths);

    const totalProfit = calculateProfit(filteredSales, inventory);
    const totalCogs = filteredSales.reduce((acc, s) => acc + calculateCOGS(s.items, inventory), 0);
    setSummary({ revenue: totalRevenue, expenses: totalCogs, profit: totalProfit });
  };

  useEffect(() => {
    const fetchFinancials = async () => {
      try {
        const [salesRes, purRes, invRes] = await Promise.all([getSales(), getPurchases(), getInventory()]);
        const sales = salesRes.data || [];
        const inventory = invRes.data || [];
        setAllSales(sales);
        setAllInventory(inventory);
        setDataReady(true);
        computeReport(sales, inventory, {});
      } catch (err) {
        console.error('Failed to load financial data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinancials();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (filters) => {
    if (dataReady) computeReport(allSales, allInventory, filters);
  };

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader title="Financial Report" description="Profit & Loss, Revenue vs Expenses based on real transactions." />
      
      <ReportFilterBar 
        showSearch={false}
        onFilter={handleFilter}
        onExport={() => alert('Exporting')}
        onPrint={() => window.print()}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${summary.revenue.toFixed(2)}`}
          color="success"
        />
        <StatCard
          title="Total COGS (Expenses)"
          value={`₹${summary.expenses.toFixed(2)}`}
          color="danger"
        />
        <StatCard
          title="Net Profit"
          value={`₹${summary.profit.toFixed(2)}`}
          color="primary"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
        {loading ? <LoadingSpinner /> : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#132B42', color: '#fff', border: '1px solid #263B50', borderRadius: '8px'}} />
                <Legend />
                <Bar dataKey="revenue" fill="#24C9A0" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses (COGS)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReport;
