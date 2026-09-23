import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Filter, X } from 'lucide-react';
import { getMedicines, deleteMedicine } from '../../services/medicineApi';
import { getInventory } from '../../services/inventoryApi';
import { calculateAvailableStock } from '../../utils/stockUtils';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { PermissionGuard } from '../../utils/permissions';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    prescription: ''
  });
  const navigate = useNavigate();

  const fetchMedicines = async () => {
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
    try {
      const [medRes, invRes] = await Promise.all([
        getMedicines(),
        getInventory()
      ]);
      const invItems = invRes.data || [];
      
      const mappedMeds = medRes.data.map(med => ({
        ...med,
        quantity: calculateAvailableStock(invItems, med.id)
      }));
      setMedicines(mappedMeds);
    } catch (error) {
      console.error('Failed to fetch medicines or inventory', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    fetchMedicines();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteMedicine(deleteDialog.id);
      setDeleteDialog({ isOpen: false, id: null });
      fetchMedicines();
    } catch (error) {
      console.error('Failed to delete medicine', error);
    }
  };

  // Filter Data
  const filteredMedicines = useMemo(() => {
    return medicines.filter(med => {
      if (filters.category && med.category !== filters.category) return false;
      if (filters.status && med.status !== filters.status) return false;
      if (filters.prescription === 'true' && !med.prescriptionRequired) return false;
      if (filters.prescription === 'false' && med.prescriptionRequired) return false;
      return true;
    });
  }, [medicines, filters]);

  const categories = [...new Set(medicines.map(m => m.category))];
  const statuses = [...new Set(medicines.map(m => m.status))];

  const clearFilters = () => setFilters({ category: '', status: '', prescription: '' });

  const columns = [
    { header: 'Medicine', accessor: 'name', cell: (row) => <span className="font-semibold text-[#162033] dark:text-white">{row.name}</span> },
    { header: 'Generic Name', accessor: 'genericName' },
    { header: 'Category', accessor: 'category' },
    { header: 'Batch', accessor: 'batchNumber' },
    { header: 'Stock', accessor: 'quantity' },
    { header: 'MRP', accessor: 'mrp', cell: (row) => `₹${row.mrp.toFixed(2)}` },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      sortable: false,
      cell: (row) => (
        <div className="flex space-x-2">
          <button 
            className="text-[#94A3B8] hover:text-[#2482ED] transition-colors cursor-pointer"
            onClick={() => navigate(`/medicines/${row.id}`)}
          >
            <Eye className="w-[18px] h-[18px]" />
          </button>
          <PermissionGuard permission="medicines.edit">
            <button 
              className="text-[#94A3B8] hover:text-[#24C9A0] transition-colors cursor-pointer"
              onClick={() => navigate(`/medicines/${row.id}/edit`)}
            >
              <Edit className="w-[18px] h-[18px]" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="medicines.delete">
            <button 
              className="text-[#94A3B8] hover:text-red-500 transition-colors cursor-pointer"
              onClick={() => setDeleteDialog({ isOpen: true, id: row.id })}
            >
              <Trash2 className="w-[18px] h-[18px]" />
            </button>
          </PermissionGuard>
        </div>
      )
    }
  ];

  const customToolbar = (
    <Button 
      variant="secondary" 
      onClick={() => setShowFilters(!showFilters)}
      className="flex items-center"
    >
      <Filter className="w-4 h-4 mr-2" /> Filters
    </Button>
  );

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Medicines" 
        description="Manage medicines, batches, pricing and stock information."
        action={
          <PermissionGuard permission="medicines.create">
            <Button onClick={() => navigate('/medicines/add')}>+ Add Medicine</Button>
          </PermissionGuard>
        }
      />

      {showFilters && (
        <div className="bg-white dark:bg-[#102A43] p-4 rounded-xl border border-[#DDE6F0] dark:border-slate-700/50 shadow-sm flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-[13px] font-semibold text-[#162033] dark:text-[#EAF3FE] mb-1.5">Category</label>
            <select 
              className="block w-48 pl-3 pr-8 py-2 text-[13px] border border-[#DDE6F0] dark:border-slate-600 bg-white dark:bg-slate-800 text-[#162033] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2482ED] focus:border-transparent cursor-pointer"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#162033] dark:text-[#EAF3FE] mb-1.5">Stock Status</label>
            <select 
              className="block w-48 pl-3 pr-8 py-2 text-[13px] border border-[#DDE6F0] dark:border-slate-600 bg-white dark:bg-slate-800 text-[#162033] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2482ED] focus:border-transparent cursor-pointer"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#162033] dark:text-[#EAF3FE] mb-1.5">Prescription</label>
            <select 
              className="block w-48 pl-3 pr-8 py-2 text-[13px] border border-[#DDE6F0] dark:border-slate-600 bg-white dark:bg-slate-800 text-[#162033] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2482ED] focus:border-transparent cursor-pointer"
              value={filters.prescription}
              onChange={(e) => setFilters({...filters, prescription: e.target.value})}
            >
              <option value="">Any</option>
              <option value="true">Required</option>
              <option value="false">Not Required</option>
            </select>
          </div>
          <button 
            onClick={clearFilters}
            className="px-4 py-2 text-[13px] font-semibold text-[#64748B] hover:text-[#162033] dark:hover:text-white cursor-pointer flex items-center bg-transparent border border-transparent hover:bg-[#F5F8FC] dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 mr-1" /> Clear
          </button>
        </div>
      )}

      <DataTable 
        columns={columns} 
        data={filteredMedicines} 
        loading={loading}
        searchPlaceholder="Search medicines, generic names or batches..."
        customToolbar={customToolbar}
      />
      
      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        title="Delete Medicine"
        message="Are you sure you want to delete this medicine? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default MedicineList;
