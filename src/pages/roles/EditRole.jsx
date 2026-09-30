import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getRoleById, updateRolePermissions } from '../../services/rolesApi';
import { migratePermissions } from '../../data/screenPermissions';
import PermissionMatrix from './components/PermissionMatrix';

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
        const loadedRole = res.data;
        setRole(loadedRole);
        // Migrate on load in case old nested format is still in localStorage
        setPermissions(migratePermissions(loadedRole.permissions));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePermissionChange = (screenId, actionId, value) => {
    const key = `${screenId}.${actionId}`;
    setPermissions(prev => ({ ...prev, [key]: value }));
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

  const isAdmin = role.name === 'Administrator';

  return (
    <div className="space-y-6 w-full pb-12">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(`/roles/${id}`)} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader title={`Configure: ${role.name}`} description="Modify screen-level access permissions for this role." />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Permission Matrix</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Control which screens and actions this role can access.</p>
          </div>
          <Button onClick={handleSave} disabled={saving || isAdmin}>
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {isAdmin && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm">
            Administrator permissions cannot be modified. They always have full access.
          </div>
        )}

        <PermissionMatrix
          permissions={permissions}
          onChange={handlePermissionChange}
          disabled={isAdmin}
          compact={false}
        />
      </div>
    </div>
  );
};

export default EditRole;
