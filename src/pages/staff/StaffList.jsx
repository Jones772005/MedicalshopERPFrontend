import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getStaffMembers, deleteStaff } from '../../services/staffApi';
import { PermissionGuard } from '../../utils/permissions';
import { useAuth } from '../../context/AuthContext';

const StaffList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });
  const [deleting, setDeleting] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await getStaffMembers();
      setStaff(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    fetchStaff();
  }, []);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteStaff(deleteDialog.id);
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchStaff();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { header: 'Emp ID', accessor: 'employeeId', cell: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.employeeId}</span> },
    { header: 'Name', accessor: 'name', cell: (row) => <span className="font-bold text-gray-900 dark:text-white">{row.name}</span> },
    { header: 'Department', accessor: 'department' },
    { header: 'Designation', accessor: 'designation' },
    { header: 'Role', accessor: 'role' },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Action',
      sortable: false,
      cell: (row) => {
        const isSelf = currentUser && (currentUser.id === row.id || currentUser.employeeId === row.employeeId);
        return (
          <div className="flex space-x-1">
            <button
              title="View Staff"
              className="p-1.5 rounded text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer"
              onClick={() => navigate(`/staff/${row.id}`)}
            >
              <Eye className="w-4 h-4" />
            </button>
            <PermissionGuard permission="staff.edit">
              <button
                title="Edit Staff"
                className="p-1.5 rounded text-[#2482ED] hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                onClick={() => navigate(`/staff/${row.id}/edit`)}
              >
                <Edit className="w-4 h-4" />
              </button>
            </PermissionGuard>
            <PermissionGuard permission="staff.deactivate">
              {!isSelf && (
                <button
                  title="Delete Staff"
                  className="p-1.5 rounded text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                  onClick={() => setDeleteDialog({ isOpen: true, id: row.id, name: row.name })}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </PermissionGuard>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Staff Management" 
        description="Manage employee records, roles, and system access."
        action={
          <PermissionGuard permission="staff.create">
            <Button onClick={() => navigate('/staff/add')}>
              <Plus className="w-4 h-4 mr-2" /> Add Staff
            </Button>
          </PermissionGuard>
        }
      />

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={staff} searchPlaceholder="Search staff by name or ID..." />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Staff Member</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{deleteDialog.name}</span>?
              {' '}This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;
