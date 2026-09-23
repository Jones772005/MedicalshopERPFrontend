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
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
        ${row.recStatus === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
          row.recStatus === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
          row.recStatus === 'Under Review' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
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
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 rounded shadow-sm">
        <div className="flex">
          <Info className="w-5 h-5 text-blue-400 dark:text-blue-500" />
          <div className="ml-3">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              These are predictive recommendations based on recent sales trends. Approving a recommendation stages it for a Purchase Order.
            </p>
          </div>
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
