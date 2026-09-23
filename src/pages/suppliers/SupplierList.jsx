import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { getSuppliers, deleteSupplier } from '../../services/supplierApi';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { PermissionGuard } from '../../utils/permissions';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const navigate = useNavigate();

  const fetchSuppliers = async () => {
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
    try {
      const response = await getSuppliers();
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    fetchSuppliers();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteSupplier(deleteDialog.id);
      setDeleteDialog({ isOpen: false, id: null });
      // eslint-disable-next-line react/set-state-in-effect
    fetchSuppliers();
    } catch (error) {
      console.error('Failed to delete supplier', error);
    }
  };

  const columns = [
    { header: 'Supplier Name', accessor: 'supplierName', cell: (row) => <span className="font-medium text-[#162033] dark:text-white">{row.supplierName}</span> },
    { header: 'Contact Person', accessor: 'contactPerson' },
    { header: 'Phone', accessor: 'phoneNumber' },
    { header: 'Email', accessor: 'email' },
    { header: 'Payment Terms', accessor: 'paymentTerms' },
    { header: 'Outstanding', accessor: 'outstandingAmount', cell: (row) => `₹${(Number(row.outstandingAmount) || 0).toFixed(2)}` },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      sortable: false,
      cell: (row) => (
        <div className="flex space-x-2">
          <button 
            className="text-gray-400 hover:text-primary-600 transition-colors cursor-pointer"
            onClick={() => navigate(`/suppliers/${row.id}`)}
          >
            <Eye className="w-5 h-5" />
          </button>
          <PermissionGuard permission="suppliers.edit">
            <button 
              className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
              onClick={() => navigate(`/suppliers/${row.id}/edit`)}
            >
              <Edit className="w-5 h-5" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="suppliers.delete">
            <button 
              className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
              onClick={() => setDeleteDialog({ isOpen: true, id: row.id })}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </PermissionGuard>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Suppliers" 
        description="Manage medical suppliers, contacts, and balances."
        action={
          <PermissionGuard permission="suppliers.create">
            <Button onClick={() => navigate('/suppliers/add')}>+ Add Supplier</Button>
          </PermissionGuard>
        }
      />
      <DataTable 
        columns={columns} 
        data={suppliers} 
        loading={loading}
        searchPlaceholder="Search suppliers by name or contact..."
      />
      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default SupplierList;
