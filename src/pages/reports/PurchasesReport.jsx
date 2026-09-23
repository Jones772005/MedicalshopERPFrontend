import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReportFilterBar from '../../components/reports/ReportFilterBar';
import StatusBadge from '../../components/common/StatusBadge';
import { getReports } from '../../services/reportApi';

const PurchasesReport = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async (filters = {}) => {
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
    try {
      const res = await getReports('purchases', filters);
      setPurchases(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    fetchPurchases();
  }, []);

  const columns = [
    { header: 'PO Number', accessor: 'purchaseOrderNumber', cell: (row) => <span className="font-medium text-primary-600 dark:text-primary-400">{row.purchaseOrderNumber || row.id}</span> },
    { header: 'Date', accessor: 'orderDate', cell: (row) => new Date(row.orderDate || row.createdAt).toLocaleDateString() },
    { header: 'Supplier', accessor: 'supplierName', cell: (row) => row.supplierName || '-' },
    { header: 'Items', accessor: 'items', cell: (row) => (row.items || []).length },
    { header: 'Tax', accessor: 'tax', cell: (row) => `₹${(Number(row.tax) || 0).toFixed(2)}` },
    { header: 'Total', accessor: 'totalAmount', cell: (row) => <span className="font-bold text-gray-900 dark:text-white">₹{(Number(row.totalAmount) || 0).toFixed(2)}</span> },
    { header: 'Paid', accessor: 'paidAmount', cell: (row) => `₹${(Number(row.paidAmount) || 0).toFixed(2)}` },
    { header: 'Outstanding', accessor: 'outstandingAmount', cell: (row) => <span className={Number(row.outstandingAmount) > 0 ? 'text-red-600 dark:text-red-400 font-medium' : 'text-green-600 dark:text-green-500'}>{`₹${(Number(row.outstandingAmount) || 0).toFixed(2)}`}</span> },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> }
  ];

  const totalPurchases = purchases.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Purchases Report" description="Procurement and purchase order history." />
      
      <ReportFilterBar 
        onFilter={fetchPurchases} 
        onExport={() => alert('Exporting (Mock)')}
        onPrint={() => window.print()}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-slate-400">Total Purchase Orders</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{purchases.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-slate-400">Total Purchase Value</div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">₹{totalPurchases.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-slate-400">Received</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{purchases.filter(p => p.status === 'Received').length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-slate-400">Pending</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{purchases.filter(p => p.status === 'Ordered').length}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={purchases} searchPlaceholder="Search purchases..." />
        )}
      </div>
    </div>
  );
};

export default PurchasesReport;
