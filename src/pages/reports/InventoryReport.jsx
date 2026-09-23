import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReportFilterBar from '../../components/reports/ReportFilterBar';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';
import { getReports } from '../../services/reportApi';

const InventoryReport = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async (filters = {}) => {
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
    try {
      const res = await getReports('inventory', filters);
      setInventory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    fetchInventory();
  }, []);

  // Compute effective status based on both quantity AND expiry date (same rules as notificationApi)
  const EXPIRY_WARNING_DAYS = 90;
  const getEffectiveStatus = (item) => {
    const qty = Number(item.quantity) || 0;
    if (qty === 0) return 'Out of Stock';
    if (item.expiryDate) {
      const today = new Date();
      const expiry = new Date(item.expiryDate);
      if (expiry < today) return 'Expired';
      const warningDate = new Date(today.getTime() + EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000);
      if (expiry <= warningDate) return 'Near Expiry';
    }
    if (qty < 50) return 'Low Stock';
    return 'Available';
  };

  const columns = [
    { header: 'Medicine', accessor: 'medicineName', cell: (row) => <span className="font-bold text-[#162033] dark:text-white">{row.medicineName || '-'}</span> },
    { header: 'Batch', accessor: 'batch' },
    { header: 'Quantity', accessor: 'quantity', cell: (row) => <span className="font-bold text-[#162033] dark:text-white">{Number(row.quantity) || 0}</span> },
    { header: 'Buy Price', accessor: 'purchasePrice', cell: (row) => `₹${(Number(row.purchasePrice) || 0).toFixed(2)}` },
    { header: 'Sell Price', accessor: 'sellingPrice', cell: (row) => `₹${(Number(row.sellingPrice) || 0).toFixed(2)}` },
    { header: 'MRP', accessor: 'mrp', cell: (row) => `₹${(Number(row.mrp) || 0).toFixed(2)}` },
    { header: 'Stock Value (Sell)', accessor: 'value', cell: (row) => <span className="font-bold text-[#162033] dark:text-white">₹{((Number(row.sellingPrice) || Number(row.mrp) || 0) * (Number(row.quantity) || 0)).toFixed(2)}</span> },
    { header: 'Expiry', accessor: 'expiryDate', cell: (row) => row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : '-' },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={getEffectiveStatus(row)} /> }
  ];

  const totalValue = inventory.reduce((acc, curr) => acc + ((Number(curr.sellingPrice) || Number(curr.mrp) || 0) * (Number(curr.quantity) || 0)), 0);

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader title="Inventory Report" description="Current stock levels and valuation." />
      
      <ReportFilterBar 
        showDateRange={false}
        showCategory={true}
        onFilter={fetchInventory} 
        onExport={() => alert('Exporting (Mock)')}
        onPrint={() => window.print()}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Stock Value (Sell Price)"
          value={`₹${totalValue.toFixed(2)}`}
          color="primary"
        />
        <StatCard
          title="Available Stock (Batches)"
          value={inventory.length.toString()}
          color="info"
        />
        <StatCard
          title="Low Stock Items"
          value={inventory.filter(i => getEffectiveStatus(i) === 'Low Stock').length.toString()}
          color="warning"
        />
        <StatCard
          title="Near Expiry"
          value={inventory.filter(i => getEffectiveStatus(i) === 'Near Expiry').length.toString()}
          color="danger"
        />
      </div>

      <div className="bg-white dark:bg-[#132B42] rounded-xl shadow-sm border border-[#DDE6F0] dark:border-[#263B50] overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={inventory} searchPlaceholder="Search inventory..." />
        )}
      </div>
    </div>
  );
};

export default InventoryReport;
