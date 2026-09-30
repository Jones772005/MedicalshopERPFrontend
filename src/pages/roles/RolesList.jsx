import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Settings, Eye, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getRoles, deleteRole } from '../../services/rolesApi';
import { PermissionGuard } from '../../utils/permissions';
import EditRoleSheet from './EditRoleSheet';

const RolesList = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit sheet state
  const [editRoleId, setEditRoleId] = useState(null);

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    fetchRoles();
  }, []);

  // ── Edit sheet handlers ────────────────────────────────────────────────
  const handleSheetClose = () => setEditRoleId(null);
  const handleSheetSaved = () => {
    setEditRoleId(null);
    fetchRoles(); // refresh the table after a successful permission update
  };

  // ── Delete dialog handlers ─────────────────────────────────────────────
  const openDeleteDialog = (row) => {
    setDeleteError('');
    setDeleteDialog({ isOpen: true, id: row.id, name: row.name });
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteRole(deleteDialog.id);
      setDeleteDialog({ isOpen: false, id: null, name: '' });
      fetchRoles();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete role.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { 
      header: 'Role Name', 
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{row.name}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">{row.description}</div>
          </div>
        </div>
      )
    },
    { header: 'Active Users', accessor: 'userCount' },
    {
      header: 'Action',
      sortable: false,
      cell: (row) => (
        <div className="flex space-x-1">
          <button
            title="View Permission Matrix"
            className="p-1.5 rounded text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer"
            onClick={() => navigate(`/roles/${row.id}`)}
          >
            <Eye className="w-4 h-4" />
          </button>
          <PermissionGuard permission="staff.roles">
            {/* Configure now opens the side sheet instead of navigating */}
            <button
              title="Configure Role"
              className="p-1.5 rounded text-[#2482ED] hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
              onClick={() => setEditRoleId(row.id)}
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              title="Delete Role"
              className="p-1.5 rounded text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
              onClick={() => openDeleteDialog(row)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </PermissionGuard>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Roles & Permissions" 
        description="Manage system access levels for different staff positions."
        action={
          <PermissionGuard permission="staff.roles">
            <Button onClick={() => navigate('/roles/new')}>
              <Plus className="w-4 h-4 mr-2" /> Add Role
            </Button>
          </PermissionGuard>
        }
      />

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={roles} searchPlaceholder="Search roles..." />
        )}
      </div>

      {/* ── Edit Role Side Sheet ─────────────────────────────────────────── */}
      <EditRoleSheet
        roleId={editRoleId}
        onClose={handleSheetClose}
        onSaved={handleSheetSaved}
      />

      {/* ── Delete Confirmation Dialog ───────────────────────────────────── */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Role</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              Are you sure you want to delete the role{' '}
              <span className="font-semibold text-gray-900 dark:text-white">"{deleteDialog.name}"</span>?
              {' '}This action cannot be undone.
            </p>
            {deleteError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                {deleteError}
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialog({ isOpen: false, id: null, name: '' })}
                disabled={deleting}
              >
                Cancel
              </Button>
              {!deleteError && (
                <Button
                  variant="danger"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesList;
