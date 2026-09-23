import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { getCustomers, deleteCustomer } from '../../services/customerApi';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { PermissionGuard } from '../../utils/permissions';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    fetchCustomers();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteCustomer(deleteDialog.id);
      setDeleteDialog({ isOpen: false, id: null });
      // eslint-disable-next-line react/set-state-in-effect
    fetchCustomers();
    } catch (error) {
      console.error('Failed to delete customer', error);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name', cell: (row) => <span className="font-medium text-gray-900">{row.name}</span> },
    { header: 'Phone Number', accessor: 'phoneNumber' },
    { header: 'Email', accessor: 'email' },
    { header: 'Total Purchases', accessor: 'totalPurchaseAmount', cell: (row) => `₹${(Number(row.totalPurchaseAmount) || 0).toFixed(2)}` },
    { header: 'Loyalty Points', accessor: 'loyaltyPoints' },
    {
      header: 'Actions',
      sortable: false,
      cell: (row) => (
        <div className="flex space-x-2">
          <button 
            className="text-gray-400 hover:text-primary-600 transition-colors cursor-pointer"
            onClick={() => navigate(`/customers/${row.id}`)}
          >
            <Eye className="w-5 h-5" />
          </button>
          <PermissionGuard permission="customers.edit">
            <button 
              className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
              onClick={() => navigate(`/customers/${row.id}/edit`)}
            >
              <Edit className="w-5 h-5" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="customers.delete">
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
        title="Customers" 
        description="Manage customer profiles, purchase history, and loyalty points."
        action={
          <PermissionGuard permission="customers.create">
            <Button onClick={() => navigate('/customers/add')}>+ Add Customer</Button>
          </PermissionGuard>
        }
      />
      <DataTable 
        columns={columns} 
        data={customers} 
        loading={loading}
        searchPlaceholder="Search customers by name, phone or email..."
      />
      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default CustomerList;
