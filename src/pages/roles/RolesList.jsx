import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Settings, Eye } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getRoles } from '../../services/rolesApi';
import { PermissionGuard } from '../../utils/permissions';

const RolesList = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchRoles();
  }, []);

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
            <button
              title="Configure Role"
              className="p-1.5 rounded text-[#2482ED] hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
              onClick={() => navigate(`/roles/${row.id}/edit`)}
            >
              <Settings className="w-4 h-4" />
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
      />

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={roles} searchPlaceholder="Search roles..." />
        )}
      </div>
    </div>
  );
};

export default RolesList;
