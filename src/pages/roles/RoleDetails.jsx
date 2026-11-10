import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Check, X } from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getRoleById } from '../../services/rolesApi';
import { PermissionGuard } from '../../utils/permissions';

const RoleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await getRoleById(id);
        setRole(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!role) return <div className="p-8 text-center text-gray-500">Role not found.</div>;

  const renderPermissionMatrix = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Module</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Permissions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {Object.entries(role.permissions).map(([module, actions]) => (
              <tr key={module}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {module}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Object.entries(actions).map(([action, hasAccess]) => (
                      <span 
                        key={action} 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          hasAccess 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'
                        }`}
                      >
                        {hasAccess ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                        <span className="capitalize">{action.replace('_', ' ')}</span>
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/roles')} className="p-1.5 h-auto text-[#64748B] hover:text-[#162033] dark:hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="text-xs font-semibold">Back to Roles</span>
          </Button>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2482ED]/10 text-[#2482ED] dark:bg-[#2482ED]/20 dark:text-blue-400 border border-[#2482ED]/20">
            {role.name}
          </span>
        </div>
        <PermissionGuard permission="staff.roles">
          <Button size="sm" onClick={() => navigate(`/roles/${role.id}/edit`)} className="self-end sm:self-auto">
            <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Role
          </Button>
        </PermissionGuard>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Permission Matrix</h3>
        </div>
        {renderPermissionMatrix()}
      </div>
    </div>
  );
};

export default RoleDetails;
