import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, Power, PowerOff, Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { getDiscounts, activateDiscount, deactivateDiscount, deleteDiscount } from '../../services/discountApi';
import { useAuth } from '../../context/AuthContext';
import { hasPermission, PermissionGuard } from '../../utils/permissions';

const getDisplayStatus = (discount) => {
  if (discount.status === 'inactive') return 'Inactive';
  
  const now = new Date();
  now.setHours(0,0,0,0);
  const nowTime = now.getTime();
  
  const startStr = typeof discount.validFrom === 'string' && discount.validFrom.length === 10 ? discount.validFrom + 'T00:00:00' : discount.validFrom;
  const endStr = typeof discount.validUntil === 'string' && discount.validUntil.length === 10 ? discount.validUntil + 'T00:00:00' : discount.validUntil;
  
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();
  
  if (nowTime < start) return 'Scheduled';
  if (nowTime > end) return 'Expired';
  return 'Active';
};

const DiscountList = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  
  const navigate = useNavigate();
  const { currentUser: user } = useAuth();

  const fetchDiscounts = async () => {
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
    try {
      const res = await getDiscounts();
      setDiscounts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleActivate = async (id) => {
    if (!window.confirm('Are you sure you want to activate this discount?')) return;
    try {
      await activateDiscount(id);
      fetchDiscounts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('This discount will no longer be eligible for future billing. Continue?')) return;
    try {
      await deactivateDiscount(id);
      fetchDiscounts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to archive this discount?')) return;
    try {
      await deleteDiscount(id);
      fetchDiscounts();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Discount ID', accessor: 'id', cell: (row) => <span className="font-medium text-primary-600 dark:text-primary-400">{row.id}</span> },
    { header: 'Discount Name', accessor: 'name' },
    { header: 'Medicine', accessor: 'medicineName' },
    { header: 'Batch', accessor: 'batchNumber', cell: (row) => row.batchNumber || 'All Batches' },
    { header: 'Type', accessor: 'discountType', cell: (row) => row.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount' },
    { header: 'Discount', accessor: 'discountValue', cell: (row) => row.discountType === 'percentage' ? `${row.discountValue}%` : `₹${row.discountValue}` },
    { header: 'Valid From', accessor: 'validFrom', cell: (row) => new Date(row.validFrom).toLocaleDateString() },
    { header: 'Valid Until', accessor: 'validUntil', cell: (row) => new Date(row.validUntil).toLocaleDateString() },
    { header: 'Status', accessor: 'displayStatus', cell: (row) => <StatusBadge status={getDisplayStatus(row)} /> },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/discounts/${row.id}`)} title="View Details">
            <Eye className="w-4 h-4" />
          </Button>
          {hasPermission(user, 'discounts.manage') && (
            <Button variant="ghost" size="sm" onClick={() => navigate(`/discounts/${row.id}/edit`)} title="Edit Discount">
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {hasPermission(user, 'discounts.activate') && (
            row.status === 'active' ? (
              <Button variant="ghost" size="sm" onClick={() => handleDeactivate(row.id)} title="Deactivate" className="text-orange-500">
                <PowerOff className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => handleActivate(row.id)} title="Activate" className="text-green-500">
                <Power className="w-4 h-4" />
              </Button>
            )
          )}
          {hasPermission(user, 'discounts.manage') && (
            <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)} title="Archive Discount" className="text-red-500">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const filteredData = discounts.filter((d) => {
    const ds = getDisplayStatus(d);
    
    // Status Filter
    if (statusFilter !== 'All' && ds !== statusFilter) return false;
    
    // Type Filter
    if (typeFilter !== 'All') {
      const isPercent = d.discountType === 'percentage';
      if (typeFilter === 'Percentage' && !isPercent) return false;
      if (typeFilter === 'Fixed Amount' && isPercent) return false;
    }

    // Search Text
    if (filterText) {
      const lowerSearch = filterText.toLowerCase();
      const matchId = String(d.id).toLowerCase().includes(lowerSearch);
      const matchName = String(d.name || '').toLowerCase().includes(lowerSearch);
      const matchMed = String(d.medicineName || '').toLowerCase().includes(lowerSearch);
      const matchBatch = String(d.batchNumber || '').toLowerCase().includes(lowerSearch);
      return matchId || matchName || matchMed || matchBatch;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Discount Management" 
        description="Create and manage promotional discounts for medicines."
        action={
          <PermissionGuard permission="discounts.manage">
            <Button onClick={() => navigate('/discounts/new')}>
              <Plus className="w-4 h-4 mr-2" /> Add Discount
            </Button>
          </PermissionGuard>
        }
      />

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
          <input 
            type="text" 
            placeholder="Search discounts..." 
            className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select 
            className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Type</label>
          <select 
            className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Percentage">Percentage</option>
            <option value="Fixed Amount">Fixed Amount</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => { setFilterText(''); setStatusFilter('All'); setTypeFilter('All'); }}>
            Reset
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : discounts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">No discounts created yet.</p>
            {hasPermission(user, 'discounts.manage') && (
              <p>Create your first discount to start managing promotional pricing.</p>
            )}
          </div>
        ) : (
          <DataTable columns={columns} data={filteredData} />
        )}
      </div>
    </div>
  );
};

export default DiscountList;
