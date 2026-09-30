import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { createRole } from '../../services/rolesApi';
import { buildDefaultPermissions } from '../../data/screenPermissions';
import PermissionMatrix from './components/PermissionMatrix';

const CreateRole = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState(buildDefaultPermissions);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handlePermissionChange = (screenId, actionId, value) => {
    const key = `${screenId}.${actionId}`;
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Role name is required.';
    if (!description.trim()) e.description = 'Description is required.';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      const res = await createRole({ name: name.trim(), description: description.trim(), permissions });
      navigate(`/roles/${res.data.id}`);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-12">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/roles')}
          className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader title="Create New Role" description="Define a name, description, and screen-level permission set for the new role." />
      </div>

      {/* Role Info */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
            placeholder="e.g. Senior Pharmacist"
            className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={e => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: undefined })); }}
            placeholder="Brief description of this role's responsibilities"
            className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Permission Matrix</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Control which screens and actions this role can access.</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate('/roles')} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" /> {saving ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        </div>

        <PermissionMatrix
          permissions={permissions}
          onChange={handlePermissionChange}
          disabled={false}
          compact={false}
        />
      </div>
    </div>
  );
};

export default CreateRole;
