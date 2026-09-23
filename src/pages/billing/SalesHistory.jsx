import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CornerUpLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getSales } from '../../services/salesApi';

const SalesHistory = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await getSales();
        // Sort by date descending
        const sorted = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setSales(sorted);
      } catch (err) {
        console.error('Failed to load sales history:', err);
      } finally {
        setLoading(false);
      }
    };
    // eslint-disable-next-line react/set-state-in-effect
    fetchSales();
  }, []);

  const columns = [
    { 
      header: 'Invoice No', 
      accessor: 'invoiceNumber',
      cell: (row) => <span className="font-medium text-primary-600 dark:text-primary-400">{row.invoiceNumber}</span>
    },
    { 
      header: 'Date', 
      accessor: 'date',
      cell: (row) => new Date(row.date).toLocaleString()
    },
    { 
      header: 'Customer', 
      accessor: 'customerName',
      cell: (row) => row.customerName || 'Walk-in'
    },
    { 
      header: 'Items', 
      accessor: 'items',
      cell: (row) => row.items.length
    },
    { 
      header: 'Total', 
      accessor: 'grandTotal',
      cell: (row) => `₹${row.grandTotal.toFixed(2)}`
    },
    { 
      header: 'Payment', 
      accessor: 'paymentMethod',
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300">
          {row.paymentMethod}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      sortable: false,
      cell: (row) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/billing/invoice/${row.id}`)}
            title="View Invoice"
          >
            <FileText className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/sales/returns/new?invoiceId=${row.id}`)}
            title="Sales Return"
            className="text-orange-600 dark:text-orange-400"
          >
            <CornerUpLeft className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Sales History" 
        description="View past invoices, print receipts, and process returns."
        action={
          <Button onClick={() => navigate('/billing')}>
            New Bill
          </Button>
        }
      />

      <DataTable 
        columns={columns} 
        data={sales} 
        searchPlaceholder="Search invoices or customers..."
      />
    </div>
  );
};

export default SalesHistory;
