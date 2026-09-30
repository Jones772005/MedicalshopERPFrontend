import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Truck, CreditCard } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import StatCard from '../../components/common/StatCard';
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
      cell: (row) => <span className="font-semibold text-[#2482ED] hover:text-[#1A6BC7] dark:text-blue-400 cursor-pointer">{row.purchaseOrderNumber || row.id}</span>
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
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/purchases/${row.id}`)}
            title="View Details"
            className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {(row.status === 'Ordered' || row.status === 'Partially Received') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/purchases/${row.id}/receive`)}
              title="Receive Goods"
              className="p-1.5 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/20"
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
              className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
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
        <StatCard
          title="Total Purchases"
          value={purchases.length.toString()}
          color="info"
        />
        <StatCard
          title="Pending Orders"
          value={purchases.filter(p => p.status === 'Ordered' || p.status === 'Partially Received').length.toString()}
          color="warning"
        />
        <StatCard
          title="Received"
          value={purchases.filter(p => p.status === 'Received').length.toString()}
          color="success"
        />
        <StatCard
          title="Pending Payments"
          value={purchases.filter(p => p.paymentStatus !== 'Paid').length.toString()}
          color="danger"
        />
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
