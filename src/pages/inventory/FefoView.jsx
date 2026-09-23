import { useState, useEffect } from 'react';
import { getInventory } from '../../services/inventoryApi';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

const FefoView = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
      try {
        const response = await getInventory();
        // In a real app, this would be sorted by medicine name, then expiry date ascending.
        // And we'd highlight the first one for each medicine.
        const sorted = response.data.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
        setInventory(sorted);
      } catch (error) {
        console.error('Failed to fetch inventory', error);
      } finally {
        setLoading(false);
      }
    };
    // eslint-disable-next-line react/set-state-in-effect
    fetchInventory();
  }, []);

  const columns = [
    { header: 'Medicine', accessor: 'medicineName', cell: (row) => <span className="font-medium text-[#162033] dark:text-white">{row.medicineName}</span> },
    { header: 'Batch', accessor: 'batch' },
    { header: 'Expiry Date', accessor: 'expiryDate' },
    { header: 'Stock', accessor: 'quantity' },
    { 
      header: 'Recommendation', 
      accessor: 'fefo', 
      cell: (row, idx) => {
        if (idx === 0 || idx === 2) {
          return <span className="px-2.5 py-0.5 inline-flex text-[11px] font-bold rounded-full bg-[#E5F9F4] text-[#24C9A0] dark:bg-[#24C9A0]/10 dark:text-[#24C9A0] border border-[#24C9A0]/30 uppercase tracking-wide">SELL FIRST</span>;
        }
        return <span className="text-[#94A3B8] dark:text-slate-500 text-[11px] uppercase tracking-wide font-medium">Standard</span>;
      }
    }
  ];

  return (
    <div className="space-y-4">
      <PageHeader 
        title="FEFO Recommendations" 
        description="First-Expire, First-Out (FEFO) batch recommendations for dispensing."
      />
      <DataTable 
        columns={columns} 
        data={inventory} 
        loading={loading}
        searchPlaceholder="Search medicines for FEFO recommendations..."
      />
    </div>
  );
};

export default FefoView;
