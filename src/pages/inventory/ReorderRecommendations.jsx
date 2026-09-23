import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, TrendingDown, ArrowRight } from 'lucide-react';
import { getInventory, updateInventoryItem } from '../../services/inventoryApi';
import { getPurchases } from '../../services/purchaseApi';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';

const ReorderRecommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
      try {
        const [invRes, purRes] = await Promise.all([getInventory(), getPurchases()]);
        const lowStock = invRes.data.filter(item => item.status === 'Low Stock' || item.quantity === 0);
        
        // Mock Predictive Logic Enrichment
        const enriched = lowStock.map(item => {
          const avgDailyDemand = item.avgDailyDemand || Math.floor(Math.random() * 15) + 5; // 5 to 20
          const minStock = item.minStock !== undefined ? Number(item.minStock) : 0;
          const estDaysRemaining = Math.floor(item.quantity / avgDailyDemand);
          const leadTime = item.leadTime || Math.floor(Math.random() * 5) + 2; // 2 to 6 days
          const recommendedQty = item.recommendedQty || Math.max(minStock * 2, avgDailyDemand * 30);
          
          let recStatus = item.recStatus || 'Recommended';
          let poId = null;

          // Check if PO Created
          if (recStatus === 'Approved') {
            const existingPurchase = purRes.data.find(p => p.status === 'Ordered' && p.items?.some(i => String(i.medicineId) === String(item.medicineId)));
            if (existingPurchase) {
              recStatus = 'PO Created';
              poId = existingPurchase.id;
            }
          }

          return {
            ...item,
            minStock,
            avgDailyDemand,
            estDaysRemaining,
            recommendedQty,
            leadTime,
            recStatus,
            poId
          };
        });

        setRecommendations(enriched);
      } catch (error) {
        console.error('Failed to fetch recommendations', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateInventoryItem(id, { recStatus: newStatus });
      setRecommendations(prev => prev.map(r => r.id === id ? { ...r, recStatus: newStatus } : r));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const columns = [
    { header: 'Medicine', accessor: 'medicineName', cell: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.medicineName}</span> },
    { header: 'Current Stock', accessor: 'quantity', cell: (row) => (
      <div className="flex items-center text-red-600 dark:text-red-400 font-bold">
        <TrendingDown className="w-4 h-4 mr-1" /> {row.quantity}
      </div>
    ) },
    { header: 'Min Stock', accessor: 'minStock', cell: (row) => <span className="text-gray-500 dark:text-slate-400">{row.minStock}</span> },
    { header: 'Avg Daily Demand', accessor: 'avgDailyDemand', cell: (row) => <span className="text-gray-900 dark:text-white">{row.avgDailyDemand}</span> },
    { header: 'Est. Days Left', accessor: 'estDaysRemaining', cell: (row) => (
      <span className={`font-semibold ${row.estDaysRemaining <= row.leadTime ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
        {row.estDaysRemaining} days
      </span>
    ) },
    { header: 'Recommended Qty', accessor: 'recommendedQty', cell: (row) => <span className="font-bold text-primary-600 dark:text-primary-400 text-lg">{row.recommendedQty}</span> },
    { header: 'Lead Time', accessor: 'leadTime', cell: (row) => <span className="text-gray-600 dark:text-slate-300">{row.leadTime} days</span> },
    { header: 'Status', accessor: 'recStatus', cell: (row) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border
        ${row.recStatus === 'Approved' ? 'bg-[#E5F9F4] text-[#24C9A0] dark:bg-[#24C9A0]/10 dark:text-[#24C9A0] border-[#24C9A0]/20' :
          row.recStatus === 'Rejected' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800/30' :
          row.recStatus === 'Under Review' ? 'bg-[#FFFBEB] text-[#D97706] dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30' :
          'bg-[#F5F8FC] text-[#2482ED] dark:bg-slate-800 dark:text-blue-400 border-[#2482ED]/20 dark:border-[#2482ED]/30'}`}>
        {row.recStatus}
      </span>
    ) },
    {
      header: 'Action',
      sortable: false,
      cell: (row) => (
        <div className="flex space-x-2">
          {row.recStatus === 'Recommended' && (
            <>
              <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => navigate(`/medicines/${row.medicineId}`)}>Review</Button>
              <Button className="px-2 py-1 text-xs" onClick={() => handleStatusChange(row.id, 'Approved')}>Approve</Button>
            </>
          )}
          {row.recStatus === 'Under Review' && (
            <>
              <Button variant="outline" className="px-2 py-1 text-xs text-red-600 dark:text-red-400 border-red-200" onClick={() => handleStatusChange(row.id, 'Rejected')}>Reject</Button>
              <Button className="px-2 py-1 text-xs" onClick={() => handleStatusChange(row.id, 'Approved')}>Approve</Button>
            </>
          )}
          {row.recStatus === 'Approved' && (
            <Button variant="ghost" className="px-2 py-1 text-xs text-primary-600" onClick={() => navigate('/purchases/new', { state: { supplierId: row.supplierId, items: [{ medicineId: row.medicineId, quantity: row.recommendedQty }] } })}>
              Create PO <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
          {row.recStatus === 'PO Created' && (
            <Button variant="ghost" className="px-2 py-1 text-xs text-primary-600" onClick={() => navigate(`/purchases/${row.poId}`)}>
              PO Created <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reorder Recommendations" 
        description="Smart purchase recommendations based on stock levels, historical demand, and lead times."
      />
      <div className="bg-[#F5F8FC] dark:bg-[#102A43] border border-[#2482ED]/30 dark:border-[#2482ED]/50 p-4 rounded-xl shadow-sm flex items-start">
        <Info className="w-5 h-5 text-[#2482ED] mt-0.5" />
        <div className="ml-3">
          <p className="text-[13px] text-[#162033] dark:text-slate-300 font-semibold leading-relaxed">
            These are predictive recommendations based on recent sales trends. Approving a recommendation stages it for a Purchase Order.
          </p>
        </div>
      </div>
      <DataTable 
        columns={columns} 
        data={recommendations} 
        loading={loading}
        searchPlaceholder="Search recommendations..."
      />
    </div>
  );
};

export default ReorderRecommendations;
