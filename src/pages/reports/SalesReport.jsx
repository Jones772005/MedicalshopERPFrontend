import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReportFilterBar from '../../components/reports/ReportFilterBar';
import { getReports } from '../../services/reportApi';

const SalesReport = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async (filters = {}) => {
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
    try {
      const res = await getReports('sales', filters);
      setSales(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    fetchSales();
  }, []);

  const handleExport = () => {
    alert('Exporting to CSV (Mock)');
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    { header: 'Invoice', accessor: 'invoiceNumber', cell: (row) => <span className="font-medium text-primary-600 dark:text-primary-400">{row.invoiceNumber || `INV-${row.id}`}</span> },
    { header: 'Date', accessor: 'date', cell: (row) => new Date(row.date || row.createdAt).toLocaleDateString() },
    { header: 'Customer', accessor: 'customerName', cell: (row) => row.customerName || 'Walk-in' },
    { header: 'Items', accessor: 'items', cell: (row) => (row.items || []).length },
    { header: 'Subtotal', accessor: 'subtotal', cell: (row) => `₹${(Number(row.subtotal) || 0).toFixed(2)}` },
    { header: 'Tax', accessor: 'tax', cell: (row) => `₹${(Number(row.tax) || 0).toFixed(2)}` },
    { header: 'Total', accessor: 'grandTotal', cell: (row) => <span className="font-bold text-gray-900 dark:text-white">₹{(Number(row.grandTotal) || 0).toFixed(2)}</span> },
    { header: 'Payment', accessor: 'paymentMethod', cell: (row) => row.paymentMethod || '-' }
  ];

  const totalRevenue = sales.reduce((acc, curr) => acc + (Number(curr.grandTotal) || 0), 0);
  const totalTax = sales.reduce((acc, curr) => acc + (Number(curr.tax) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Sales Report" description="Comprehensive sales and revenue data." />
      
      <ReportFilterBar 
        onFilter={fetchSales} 
        onExport={handleExport}
        onPrint={handlePrint}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-slate-400">Total Sales (Count)</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{sales.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-slate-400">Total Revenue</div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">₹{totalRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-slate-400">Total Tax Collected</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalTax.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-slate-400">Avg Bill Value</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{sales.length ? (totalRevenue / sales.length).toFixed(2) : 0}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={sales} searchPlaceholder="Search invoices..." />
        )}
      </div>
    </div>
  );
};

export default SalesReport;
