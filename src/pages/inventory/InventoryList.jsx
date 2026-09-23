import { useState, useEffect } from 'react';
import { getInventory } from '../../services/inventoryApi';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { getMedicines } from '../../services/medicineApi';

const getDaysRemaining = (expiryDate) => {
  if (!expiryDate) return Infinity;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('ALL');

  useEffect(() => {
    const fetchInventory = async () => {
      // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
      try {
        const [invRes, medRes] = await Promise.all([
          getInventory(),
          getMedicines()
        ]);
        setInventory(invRes.data);
        setMedicines(medRes.data);
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
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Purchase Price', accessor: 'purchasePrice', cell: (row) => `\u20b9${(Number(row.purchasePrice) || 0).toFixed(2)}` },
    { header: 'Selling Price', accessor: 'sellingPrice', cell: (row) => `\u20b9${(Number(row.sellingPrice) || 0).toFixed(2)}` },
    { header: 'Expiry Date', accessor: 'expiryDate' },
    { header: 'Rack', accessor: 'rack' },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
  ];

  const getFilteredData = () => {
    if (filterMode === 'ALL') return inventory;
    
    if (filterMode === 'LOW') {
      const minStockMap = {};
      medicines.forEach(m => { minStockMap[m.id] = Number(m.minimumStockLevel); });
      return inventory.filter(item => {
        if (item.quantity === 0 || item.status === 'Out of Stock') return false;
        const minStock = minStockMap[item.medicineId];
        const threshold = minStock !== undefined && !isNaN(minStock) ? minStock : 0;
        return Number(item.quantity) <= threshold;
      });
    }
    
    if (filterMode === 'EXPIRY') {
      return inventory.filter(item => {
        const days = getDaysRemaining(item.expiryDate);
        return days >= 0 && days <= 90;
      });
    }
    return inventory;
  };

  const filteredData = getFilteredData();

  return (
    <div>
      <PageHeader 
        title="Inventory" 
        description="Monitor real-time stock levels and batch expirations."
      />
      <div className="flex mb-4 space-x-2">
        <button 
          onClick={() => setFilterMode('ALL')}
          className={`px-4 py-2 text-[13px] font-semibold rounded-lg border cursor-pointer transition-colors ${filterMode === 'ALL' ? 'bg-[#F5F8FC] dark:bg-slate-800 text-[#2482ED] border-[#2482ED]' : 'bg-white dark:bg-[#102A43] border-[#DDE6F0] dark:border-slate-700 text-[#64748B] dark:text-slate-300 hover:text-[#162033] dark:hover:text-white hover:bg-[#F5F8FC] dark:hover:bg-slate-800'}`}
        >All Stock</button>
        <button 
          onClick={() => setFilterMode('LOW')}
          className={`px-4 py-2 text-[13px] font-semibold rounded-lg border cursor-pointer transition-colors ${filterMode === 'LOW' ? 'bg-[#FFFBEB] dark:bg-amber-900/20 text-[#D97706] border-[#D97706]' : 'bg-white dark:bg-[#102A43] border-[#DDE6F0] dark:border-slate-700 text-[#64748B] dark:text-slate-300 hover:text-[#D97706] hover:bg-[#FFFBEB] dark:hover:bg-amber-900/20'}`}
        >Low Stock</button>
        <button 
          onClick={() => setFilterMode('EXPIRY')}
          className={`px-4 py-2 text-[13px] font-semibold rounded-lg border cursor-pointer transition-colors ${filterMode === 'EXPIRY' ? 'bg-[#FFFBEB] dark:bg-amber-900/20 text-[#D97706] border-[#D97706]' : 'bg-white dark:bg-[#102A43] border-[#DDE6F0] dark:border-slate-700 text-[#64748B] dark:text-slate-300 hover:text-[#D97706] hover:bg-[#FFFBEB] dark:hover:bg-amber-900/20'}`}
        >Near Expiry</button>
      </div>
      <DataTable 
        columns={columns} 
        data={filteredData} 
        loading={loading}
        searchPlaceholder="Search inventory by medicine or batch..."
      />
    </div>
  );
};

export default InventoryList;
