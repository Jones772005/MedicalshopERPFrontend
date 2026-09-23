import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReportFilterBar from '../../components/reports/ReportFilterBar';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';
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
    <div className="space-y-6 w-full pb-12">
      <PageHeader title="Purchases Report" description="Procurement and purchase order history." />
      
      <ReportFilterBar 
        onFilter={fetchPurchases} 
        onExport={() => alert('Exporting (Mock)')}
        onPrint={() => window.print()}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Purchase Orders"
          value={purchases.length.toString()}
          color="info"
        />
        <StatCard
          title="Total Purchase Value"
          value={`₹${totalPurchases.toFixed(2)}`}
          color="primary"
        />
        <StatCard
          title="Received"
          value={purchases.filter(p => p.status === 'Received').length.toString()}
          color="success"
        />
        <StatCard
          title="Pending"
          value={purchases.filter(p => p.status === 'Ordered').length.toString()}
          color="warning"
        />
      </div>

      <div className="bg-white dark:bg-[#132B42] rounded-xl shadow-sm border border-[#DDE6F0] dark:border-[#263B50] overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={purchases} searchPlaceholder="Search purchases..." />
        )}
      </div>
    </div>
  );
};

export default PurchasesReport;
