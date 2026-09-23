import { useState, useEffect } from 'react';
import { getInventory, getOutOfStockItems } from '../../services/inventoryApi';
import { getSuppliers } from '../../services/supplierApi';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';

const OutOfStockList = () => {
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
        const outOfStock = getOutOfStockItems(invRes.data);
        setInventory(outOfStock);
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
    { header: 'Generic Name', accessor: 'medicineName' }, // Simplified for mock
    { 
      header: 'Batch', 
      accessor: 'batch',
      cell: (row) => {
        const batchNumber = row.batch || row.batchNumber || '-';
        return (
          <span title={batchNumber} className="block max-w-[150px] truncate text-gray-700 dark:text-slate-300">
            {batchNumber}
          </span>
        );
      }
    },
    { header: 'Supplier', accessor: 'supplier' },
    { header: 'Last Purchase', accessor: 'purchasePrice', cell: (row) => `₹${row.purchasePrice.toFixed(2)}` },
    { header: 'Last Selling Price', accessor: 'sellingPrice', cell: (row) => `₹${row.sellingPrice.toFixed(2)}` },
    {
      header: 'Action',
      sortable: false,
      cell: (row) => (
        <Button onClick={() => handleReorder(row)}>Reorder</Button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Out of Stock" 
        description="Medicines that are completely out of stock and require immediate reordering."
      />
      <DataTable 
        columns={columns} 
        data={inventory} 
        loading={loading}
        searchPlaceholder="Search out of stock medicines..."
      />
    </div>
  );
};

export default OutOfStockList;
