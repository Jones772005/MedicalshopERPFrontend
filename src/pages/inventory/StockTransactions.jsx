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
    { header: 'Medicine', accessor: 'medicine', cell: (row) => <span className="font-medium text-[#162033] dark:text-white">{row.medicine}</span> },
    { header: 'Batch', accessor: 'batch' },
    { 
      header: 'Type', 
      accessor: 'type',
      cell: (row) => (
        <span className={`px-2.5 py-0.5 inline-flex text-[11px] font-bold uppercase tracking-wider rounded-full ${
          row.type === 'Purchase' ? 'bg-[#F5F8FC] text-[#2482ED] dark:bg-[#2482ED]/10 dark:text-[#2482ED] border border-[#2482ED]/20' :
          row.type === 'Sale' ? 'bg-[#E5F9F4] text-[#24C9A0] dark:bg-[#24C9A0]/10 dark:text-[#24C9A0] border border-[#24C9A0]/20' :
          row.type === 'Damage' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/30' :
          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
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
