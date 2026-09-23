import { useState, useEffect } from 'react';
import { getTransactions } from '../../services/inventoryApi';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';

const StockTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
      try {
        const response = await getTransactions();
        setTransactions(response.data);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const columns = [
    { header: 'Date', accessor: 'date', cell: (row) => formatDate(row.date) },
    { header: 'Medicine', accessor: 'medicine', cell: (row) => <span className="font-medium text-gray-900">{row.medicine}</span> },
    { header: 'Batch', accessor: 'batch' },
    { 
      header: 'Type', 
      accessor: 'type',
      cell: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          row.type === 'Purchase' ? 'bg-blue-100 text-blue-800' :
          row.type === 'Sale' ? 'bg-green-100 text-green-800' :
          row.type === 'Damage' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.type}
        </span>
      )
    },
    { 
      header: 'Quantity', 
      accessor: 'quantity',
      cell: (row) => (
        <span className={`font-bold ${row.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
        </span>
      )
    },
    { header: 'Previous Stock', accessor: 'previousStock' },
    { header: 'New Stock', accessor: 'newStock' },
    { header: 'Reference', accessor: 'reference', cell: (row) => <span className="text-primary-600">{row.reference}</span> },
    { header: 'User', accessor: 'user' }
  ];

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Stock Transactions" 
        description="View complete history of all inventory movements."
        action={<Button>Adjust Stock</Button>}
      />
      <DataTable 
        columns={columns} 
        data={transactions} 
        loading={loading}
        searchPlaceholder="Search transactions by medicine, batch, or reference..."
      />
    </div>
  );
};

export default StockTransactions;
