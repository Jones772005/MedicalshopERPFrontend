import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { getInventory, getDaysRemaining, getExpiryCategory } from '../../services/inventoryApi';
import { getPurchases } from '../../services/purchaseApi';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';

// Using shared helpers from inventoryApi
const ExpiryManagement = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchInventory = async () => {
      // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
      try {
        const [invRes, purRes] = await Promise.all([getInventory(), getPurchases()]);
        
        // Build batch-to-purchase map
        const batchToPurchaseMap = {};
        purRes.data.forEach(purchase => {
          const items = purchase.receivedItems || purchase.items || [];
          items.forEach(item => {
            const batch = item.batchNumber || item.batch;
            if (batch) {
              const key = `${item.medicineId}-${batch}`;
              if (!batchToPurchaseMap[key]) {
                batchToPurchaseMap[key] = [];
              }
              // Avoid duplicates if same purchase has multiple entries for same batch (rare but possible)
              if (!batchToPurchaseMap[key].includes(purchase.id)) {
                batchToPurchaseMap[key].push(purchase.id);
              }
            }
          });
        });

        const mappedData = invRes.data.map(item => {
          const daysRemaining = getDaysRemaining(item.expiryDate);
          const key = `${item.medicineId}-${item.batch}`;
          let sourcePurchaseId = null;
          let possiblePurchaseIds = [];
          if (batchToPurchaseMap[key]) {
            possiblePurchaseIds = batchToPurchaseMap[key];
            if (batchToPurchaseMap[key].length === 1) {
              sourcePurchaseId = batchToPurchaseMap[key][0];
            }
          }

          return {
            ...item,
            daysRemaining,
            expiryCategory: getExpiryCategory(daysRemaining),
            sourcePurchaseId,
            possiblePurchaseIds
          };
        });
        setInventory(mappedData);
      } catch (error) {
        console.error('Failed to fetch inventory', error);
      } finally {
        setLoading(false);
      }
    };
    // eslint-disable-next-line react/set-state-in-effect
    fetchInventory();
  }, []);

  const filteredData = inventory.filter(item => {
    if (item.expiryCategory === 'Normal') return false;
    if (activeTab === 'All') return true;
    return item.expiryCategory === activeTab;
  });

  const columns = [
    { header: 'Medicine', accessor: 'medicineName', cell: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.medicineName}</span> },
    { header: 'Batch', accessor: 'batch' },
    { header: 'Expiry Date', accessor: 'expiryDate', cell: (row) => <span className="font-semibold text-gray-900 dark:text-white">{new Date(row.expiryDate).toLocaleDateString()}</span> },
    { header: 'Days Remaining', accessor: 'daysRemaining', cell: (row) => (
      <span className={`font-semibold ${row.daysRemaining < 0 ? 'text-red-600 dark:text-red-400' : row.daysRemaining <= 30 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-gray-300'}`}>
        {row.daysRemaining < 0 ? 'Expired' : `${row.daysRemaining} days`}
      </span>
    ) },
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Supplier', accessor: 'supplier' },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.daysRemaining < 0 ? 'Expired' : 'Near Expiry'} /> },
    {
      header: 'Action',
      sortable: false,
      cell: (row) => (
        <button 
          onClick={() => {
            if (row.quantity === 0) return;
            const reason = row.daysRemaining < 0 ? 'Expired' : 'Near Expiry';
            navigate('/purchases/returns', {
              state: {
                prefill: {
                  medicineId: row.medicineId,
                  medicineName: row.medicineName,
                  batch: row.batch,
                  supplierId: row.supplierId,
                  supplierName: row.supplier,
                  availableQuantity: row.quantity,
                  sourcePurchaseId: row.sourcePurchaseId,
                  possiblePurchaseIds: row.possiblePurchaseIds,
                  reason
                }
              }
            });
          }}
          disabled={row.quantity === 0}
          className={`text-[13px] font-semibold transition-colors ${row.quantity === 0 ? 'text-[#94A3B8] dark:text-slate-500 cursor-not-allowed' : 'text-[#2482ED] dark:text-blue-400 hover:text-[#1A6BC7] dark:hover:text-blue-300 cursor-pointer'}`}
        >
          {row.quantity === 0 ? 'No Stock' : 'Return to Supplier'}
        </button>
      )
    }
  ];

  const tabs = ['All', 'Expired', 'Within 7 Days', 'Within 30 Days', 'Within 60 Days', 'Within 90 Days'];

  // Summary counts
  const counts = {
    'Expired': inventory.filter(i => i.expiryCategory === 'Expired').length,
    'Within 7 Days': inventory.filter(i => i.expiryCategory === 'Within 7 Days').length,
    'Within 30 Days': inventory.filter(i => i.expiryCategory === 'Within 30 Days').length,
    'Within 60 Days': inventory.filter(i => i.expiryCategory === 'Within 60 Days').length,
    'Within 90 Days': inventory.filter(i => i.expiryCategory === 'Within 90 Days').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Expiry Management" 
        description="Monitor medicine expirations to minimize wastage and process returns."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#102A43] p-4 rounded-xl shadow-sm border border-[#DDE6F0] dark:border-slate-700/50 flex flex-col justify-center">
          <div className="text-[13px] font-semibold text-red-600 dark:text-red-400 flex items-center mb-1.5"><ShieldAlert className="w-4 h-4 mr-1.5" /> Expired</div>
          <div className="text-2xl font-bold text-[#162033] dark:text-white">{counts['Expired']}</div>
        </div>
        <div className="bg-white dark:bg-[#102A43] p-4 rounded-xl shadow-sm border border-[#DDE6F0] dark:border-slate-700/50 flex flex-col justify-center">
          <div className="text-[13px] font-semibold text-orange-600 dark:text-orange-400 flex items-center mb-1.5"><AlertTriangle className="w-4 h-4 mr-1.5" /> &lt; 7 Days</div>
          <div className="text-2xl font-bold text-[#162033] dark:text-white">{counts['Within 7 Days']}</div>
        </div>
        <div className="bg-white dark:bg-[#102A43] p-4 rounded-xl shadow-sm border border-[#DDE6F0] dark:border-slate-700/50 flex flex-col justify-center">
          <div className="text-[13px] font-semibold text-amber-600 dark:text-amber-400 flex items-center mb-1.5"><AlertTriangle className="w-4 h-4 mr-1.5" /> &lt; 30 Days</div>
          <div className="text-2xl font-bold text-[#162033] dark:text-white">{counts['Within 30 Days']}</div>
        </div>
        <div className="bg-white dark:bg-[#102A43] p-4 rounded-xl shadow-sm border border-[#DDE6F0] dark:border-slate-700/50 flex flex-col justify-center">
          <div className="text-[13px] font-semibold text-[#2482ED] dark:text-blue-400 flex items-center mb-1.5"><Info className="w-4 h-4 mr-1.5" /> &lt; 60 Days</div>
          <div className="text-2xl font-bold text-[#162033] dark:text-white">{counts['Within 60 Days']}</div>
        </div>
        <div className="bg-white dark:bg-[#102A43] p-4 rounded-xl shadow-sm border border-[#DDE6F0] dark:border-slate-700/50 flex flex-col justify-center">
          <div className="text-[13px] font-semibold text-[#64748B] dark:text-slate-400 flex items-center mb-1.5"><CheckCircle2 className="w-4 h-4 mr-1.5" /> &lt; 90 Days</div>
          <div className="text-2xl font-bold text-[#162033] dark:text-white">{counts['Within 90 Days']}</div>
        </div>
      </div>
      
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-3 px-4 border-b-2 font-semibold text-[13px] cursor-pointer transition-colors
                ${activeTab === tab 
                  ? 'border-[#2482ED] text-[#2482ED]'
                  : 'border-transparent text-[#64748B] dark:text-slate-400 hover:text-[#162033] dark:hover:text-white hover:border-[#DDE6F0] dark:hover:border-slate-600'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredData} 
        loading={loading}
        searchPlaceholder="Search near expiry medicines..."
      />
    </div>
  );
};

export default ExpiryManagement;
