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
    { header: 'Medicine', accessor: 'medicineName', cell: (row) => <span className="font-medium text-gray-900">{row.medicineName}</span> },
    { header: 'Batch', accessor: 'batch' },
    { header: 'Expiry Date', accessor: 'expiryDate' },
    { header: 'Stock', accessor: 'quantity' },
    { 
      header: 'Recommendation', 
      accessor: 'fefo', 
      cell: (row, idx) => {
        // Mock FEFO logic: just highlight the first item (pretend it's the earliest batch)
        if (idx === 0 || idx === 2) {
          return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800 border border-green-200">SELL FIRST</span>;
        }
        return <span className="text-gray-400 text-xs">Standard</span>;
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
