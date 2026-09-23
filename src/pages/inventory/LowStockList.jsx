import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInventory, getLowStockItems } from '../../services/inventoryApi';
import { getSuppliers } from '../../services/supplierApi';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';

const LowStockList = () => {
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invRes, supRes] = await Promise.all([
          getInventory(),
          getSuppliers()
        ]);
        const lowStock = getLowStockItems(invRes.data);
        setInventory(lowStock);
        setSuppliers(supRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleReorder = (row) => {
    const supplier = suppliers.find(s => s.supplierName === row.supplier);
    const supplierId = supplier ? supplier.id : undefined;
    
    // Use the same smart recommendation logic as ReorderRecommendations.jsx
    const avgDailyDemand = row.avgDailyDemand || 10;
    const minStock = row.minStock !== undefined ? Number(row.minStock) : 0;
    const recommendedQty = row.recommendedQty || Math.max(minStock * 2, avgDailyDemand * 30);

    navigate('/purchases/new', { 
      state: { 
        supplierId, 
        items: [{ medicineId: row.medicineId, quantity: recommendedQty }] 
      } 
    });
  };

  const columns = [
    { header: 'Medicine', accessor: 'medicineName', cell: (row) => <span className="font-medium text-[#162033] dark:text-white">{row.medicineName}</span> },
    { header: 'Batch', accessor: 'batch' },
    { header: 'Current Stock', accessor: 'quantity', cell: (row) => <span className="font-bold text-orange-600">{row.quantity}</span> },
    { header: 'Suggested Reorder', accessor: 'reorder', cell: (row) => {
      const avgDailyDemand = row.avgDailyDemand || 10;
      const minStock = row.minStock !== undefined ? Number(row.minStock) : 0;
      return row.recommendedQty || Math.max(minStock * 2, avgDailyDemand * 30);
    } },
    { header: 'Supplier', accessor: 'supplier' },
    { header: 'Expiry', accessor: 'expiryDate' },
    {
      header: 'Action',
      sortable: false,
      cell: (row) => (
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => navigate(`/medicines/${row.medicineId}`)}>View</Button>
          <Button onClick={() => handleReorder(row)}>Reorder</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Low Stock" 
        description="Medicines that have fallen below their minimum stock level."
      />
      <DataTable 
        columns={columns} 
        data={inventory} 
        loading={loading}
        searchPlaceholder="Search low stock medicines..."
      />
    </div>
  );
};

export default LowStockList;
