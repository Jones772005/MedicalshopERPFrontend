import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Truck, CreditCard } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getPurchases } from '../../services/purchaseApi';
import { getSuppliers } from '../../services/supplierApi';
import { PermissionGuard } from '../../utils/permissions';

const PurchaseList = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [purchasesRes, suppliersRes] = await Promise.all([
          getPurchases(),
          getSuppliers()
        ]);
        const sortedPurchases = [...purchasesRes.data].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        setPurchases(sortedPurchases);
        setSuppliers(suppliersRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getSupplierName = (id) => {
    const supplier = suppliers.find(s => s.id === id);
    return supplier ? supplier.supplierName : 'Unknown Supplier';
  };

  const columns = [
    { 
      header: 'Purchase Order', 
      accessor: 'purchaseOrderNumber',
      cell: (row) => <span className="font-medium text-primary-600 dark:text-primary-400">{row.purchaseOrderNumber || row.id}</span>
    },
    { 
      header: 'Supplier', 
      accessor: 'supplierId',
      cell: (row) => getSupplierName(row.supplierId)
    },
    { 
      header: 'Order Date', 
      accessor: 'orderDate',
      cell: (row) => new Date(row.orderDate).toLocaleDateString()
    },
    { 
      header: 'Amount', 
      accessor: 'totalAmount',
      cell: (row) => `₹${row.totalAmount.toFixed(2)}`
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />
    },
    { 
      header: 'Payment', 
      accessor: 'paymentStatus',
      cell: (row) => <StatusBadge status={row.paymentStatus} />
    },
    {
      header: 'Actions',
      sortable: false,
      cell: (row) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/purchases/${row.id}`)}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {(row.status === 'Ordered' || row.status === 'Partially Received') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/purchases/${row.id}/receive`)}
              title="Receive Goods"
              className="text-blue-600 dark:text-blue-400"
            >
              <Truck className="w-4 h-4" />
            </Button>
          )}
          {(row.paymentStatus === 'Pending' || row.paymentStatus === 'Partial') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/payments/new?purchaseId=${row.id}`)}
              title="Record Payment"
              className="text-green-600 dark:text-green-400"
            >
              <CreditCard className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Purchases" 
        description="Manage supplier orders, received medicines and purchase invoices."
        action={
          <PermissionGuard permission="purchases.create">
            <Button onClick={() => navigate('/purchases/new')}>
              <Plus className="w-4 h-4 mr-2" />
              New Purchase
            </Button>
          </PermissionGuard>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="text-sm text-gray-500 dark:text-slate-400">Total Purchases</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{purchases.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="text-sm text-gray-500 dark:text-slate-400">Pending Orders</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {purchases.filter(p => p.status === 'Ordered' || p.status === 'Partially Received').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="text-sm text-gray-500 dark:text-slate-400">Received</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {purchases.filter(p => p.status === 'Received').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="text-sm text-gray-500 dark:text-slate-400">Pending Payments</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {purchases.filter(p => p.paymentStatus !== 'Paid').length}
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={purchases} 
        searchPlaceholder="Search purchases..."
      />
    </div>
  );
};

export default PurchaseList;
