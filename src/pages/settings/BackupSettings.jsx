import { useState, useEffect, useRef } from 'react';
import { Save, Database, Download, UploadCloud, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import { useSettings } from '../../context/SettingsContext';
import { createBackup, restoreBackup } from '../../services/backupApi';

const BackupSettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.backup);
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef(null);
  const [lastBackupDetails, setLastBackupDetails] = useState({
    date: settings.backup?.lastBackup,
    size: settings.backup?.backupSize
  });

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    setFormData(settings.backup);
  }, [settings.backup]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateCategorySettings('backup', formData);
    setSaving(false);
    alert('Backup settings saved successfully!');
  };

  const handleManualBackup = async () => {
    setBackingUp(true);
    try {
      const res = await createBackup();
      
      // Trigger download
      const blob = new Blob([res.data.content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastBackupDetails({
        date: res.data.timestamp,
        size: res.data.size
      });
      alert(`Backup created successfully: ${res.data.filename}`);
    } catch (err) {
      console.error(err);
      alert('Backup failed.');
    } finally {
      setBackingUp(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (confirm('Are you sure you want to restore from this backup? This will overwrite all current data.')) {
      setRestoring(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          await restoreBackup(event.target.result);
          alert('Database restored successfully! The page will now reload.');
          window.location.reload();
        } catch (error) {
          console.error(error);
          alert(error.message);
        } finally {
          setRestoring(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    } else {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Database className="w-5 h-5 mr-2 text-primary-500" /> Database Backup & Restore
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage local and cloud backups of your ERP data.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 border border-gray-200 dark:border-slate-700 rounded-lg">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Automated Backups</h3>
            
            <label className="flex items-center mb-4">
              <input type="checkbox" name="autoBackup" checked={formData.autoBackup} onChange={handleChange} className="form-checkbox h-4 w-4 text-primary-600 rounded" />
              <span className="ml-3 text-sm text-gray-900 dark:text-white font-medium">Enable Automated Backups</span>
            </label>

            {formData.autoBackup && (
              <div className="space-y-4 pl-7 border-l-2 border-gray-100 dark:border-slate-700 ml-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Backup Frequency</label>
                  <select 
                    name="frequency" 
                    value={formData.frequency} 
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Hourly">Hourly</option>
                    <option value="Daily">Daily (Midnight)</option>
                    <option value="Weekly">Weekly (Sunday)</option>
                    <option value="Monthly">Monthly (1st)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Retention Period</label>
                  <select 
                    name="retentionDays" 
                    value={formData.retentionDays} 
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
                  >
                    <option value="7">Keep for 7 days</option>
                    <option value="30">Keep for 30 days</option>
                    <option value="90">Keep for 90 days</option>
                    <option value="365">Keep for 1 year</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border border-blue-100 dark:border-slate-700 p-5 rounded-lg text-center shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Manual Backup</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
              Create an immediate snapshot of your database (Medicines, Inventory, Sales, Users).
            </p>
            
            <Button onClick={handleManualBackup} disabled={backingUp} className="w-full justify-center py-3 text-base shadow-md">
              {backingUp ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
              {backingUp ? 'Generating Backup...' : 'Generate Now'}
            </Button>

            {lastBackupDetails.date && (
              <div className="mt-6 pt-4 border-t border-blue-100 dark:border-slate-700 text-sm text-left">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500 dark:text-slate-400">Last Backup:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{new Date(lastBackupDetails.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Size:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{lastBackupDetails.size}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 border border-gray-200 dark:border-slate-700 rounded-lg">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <UploadCloud className="w-4 h-4 mr-2 text-gray-500" /> Restore from Backup
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
              Upload a previously generated .sql or .json backup file to restore your system state.
            </p>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-slate-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-slate-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {restoring ? (
                    <RefreshCw className="w-8 h-8 mb-3 text-gray-400 animate-spin" />
                  ) : (
                    <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                  )}
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">.json backup files only</p>
                </div>
                <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={restoring} />
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BackupSettings;
