import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getRoleById, updateRolePermissions } from '../../services/rolesApi';

const EditRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await getRoleById(id);
        setRole(res.data);
        setPermissions(JSON.parse(JSON.stringify(res.data.permissions))); // Deep copy
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggle = (module, action) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action]
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateRolePermissions(id, permissions);
      navigate(`/roles/${id}`);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!role) return <div className="p-8 text-center text-gray-500">Role not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(`/roles/${id}`)} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader title={`Configure: ${role.name}`} description="Modify access permissions for this role." />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Permission Matrix</h3>
          <Button onClick={handleSave} disabled={saving || role.name === 'Administrator'}>
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
        
        {role.name === 'Administrator' && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm">
            Administrator permissions cannot be modified. They always have full access.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Module</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Permissions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {Object.entries(permissions).map(([module, actions]) => (
                <tr key={module}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {module}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                    <div className="flex flex-wrap gap-4">
                      {Object.entries(actions).map(([action, hasAccess]) => (
                        <label key={action} className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 disabled:opacity-50"
                            checked={hasAccess}
                            onChange={() => handleToggle(module, action)}
                            disabled={role.name === 'Administrator'}
                          />
                          <span className="ml-2 text-sm capitalize text-gray-700 dark:text-gray-300">
                            {action.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EditRole;
