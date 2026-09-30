import { useState, useRef } from 'react';
import { Database, Download, UploadCloud, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import { useSettings } from '../../context/SettingsContext';
import { createBackup, restoreBackup } from '../../services/backupApi';
import SettingsHeader from '../../components/settings/SettingsHeader';
import SettingsSection from '../../components/settings/SettingsSection';

const BackupSettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.backup || {});
  const [prevSettings, setPrevSettings] = useState(settings.backup);
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef(null);
  const [lastBackupDetails, setLastBackupDetails] = useState({
    date: settings.backup?.lastBackup,
    size: settings.backup?.backupSize
  });

  if (prevSettings !== settings.backup) {
    setPrevSettings(settings.backup);
    setFormData(settings.backup || {});
  }

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(settings.backup);

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
    <div>
      <SettingsHeader
        icon={Database}
        title="Database Backup & Restore"
        description="Schedule automated data archives, download immediate snapshots, or restore system state."
        onSave={handleSave}
        saving={saving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Left Column: Automated Backups */}
        <div className="space-y-6">
          <SettingsSection title="Automated Backup Schedule">
            <div className="bg-[#F8FAFC] dark:bg-slate-800/40 p-4 rounded-xl border border-[#DDE6F0] dark:border-slate-700/60 space-y-4">
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#DDE6F0] dark:border-slate-700/60 bg-white dark:bg-[#102A43] cursor-pointer">
                <div>
                  <span className="block text-xs sm:text-sm font-bold text-[#162033] dark:text-white">
                    Enable Automated Periodic Backups
                  </span>
                  <span className="block text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                    Automatically generates encrypted database archives in background
                  </span>
                </div>
                <input 
                  type="checkbox" 
                  name="autoBackup" 
                  checked={formData.autoBackup || false} 
                  onChange={handleChange} 
                  className="h-4 w-4 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                />
              </label>

              {formData.autoBackup && (
                <div className="space-y-4 pt-1">
                  <div>
                    <label htmlFor="backupFreq" className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-300 mb-1.5">
                      Backup Frequency
                    </label>
                    <select 
                      id="backupFreq"
                      name="frequency" 
                      value={formData.frequency || 'Daily'} 
                      onChange={handleChange} 
                      className="block w-full rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-2 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100 transition-colors"
                    >
                      <option value="Hourly">Hourly (High Frequency)</option>
                      <option value="Daily">Daily (Midnight Batch - Recommended)</option>
                      <option value="Weekly">Weekly (Every Sunday)</option>
                      <option value="Monthly">Monthly (1st of Month)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="retentionDays" className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-300 mb-1.5">
                      Retention Window
                    </label>
                    <select 
                      id="retentionDays"
                      name="retentionDays" 
                      value={formData.retentionDays || 30} 
                      onChange={handleChange} 
                      className="block w-full rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-2 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100 transition-colors"
                    >
                      <option value="7">Keep archives for 7 days</option>
                      <option value="30">Keep archives for 30 days</option>
                      <option value="90">Keep archives for 90 days</option>
                      <option value="365">Keep archives for 1 full year</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </SettingsSection>
        </div>

        {/* Right Column: Manual Snapshot & Restore */}
        <div className="space-y-6">
          <SettingsSection title="Manual Snapshot Download">
            <div className="bg-[#F8FAFC] dark:bg-slate-800/40 p-4 rounded-xl border border-[#DDE6F0] dark:border-slate-700/60 space-y-3">
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Generate an immediate full export containing all medicines, batches, customers, sales invoices, and security configurations.
              </p>

              <Button 
                type="button"
                onClick={handleManualBackup} 
                disabled={backingUp} 
                className="w-full justify-center h-10 text-xs font-semibold shadow-xs"
              >
                {backingUp ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {backingUp ? 'Generating Archive...' : 'Download Immediate Backup'}
              </Button>

              {lastBackupDetails.date && (
                <div className="pt-2 text-[11px] text-[#64748B] dark:text-slate-400 border-t border-[#DDE6F0]/70 dark:border-slate-700/50 flex justify-between">
                  <span>Last backup: <strong className="text-[#162033] dark:text-slate-200">{new Date(lastBackupDetails.date).toLocaleDateString()}</strong></span>
                  <span>Size: <strong className="text-[#162033] dark:text-slate-200">{lastBackupDetails.size}</strong></span>
                </div>
              )}
            </div>
          </SettingsSection>

          <SettingsSection title="Restore System State">
            <div className="bg-[#F8FAFC] dark:bg-slate-800/40 p-4 rounded-xl border border-[#DDE6F0] dark:border-slate-700/60 space-y-3">
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Upload a verified ERP <code className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-[#DDE6F0] dark:border-slate-700">.json</code> snapshot to rollback or restore data.
              </p>

              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#DDE6F0] dark:border-slate-700 rounded-xl cursor-pointer bg-white dark:bg-[#102A43] hover:bg-[#F5F8FC] dark:hover:bg-slate-800/50 transition-colors p-3 text-center">
                {restoring ? (
                  <RefreshCw className="w-6 h-6 text-[#2482ED] animate-spin mb-1" />
                ) : (
                  <UploadCloud className="w-6 h-6 text-[#2482ED] mb-1" />
                )}
                <span className="text-xs font-semibold text-[#162033] dark:text-white">
                  {restoring ? 'Restoring Database...' : 'Click to select or drop backup file'}
                </span>
                <span className="text-[10px] text-[#94A3B8] dark:text-slate-500 mt-0.5">
                  Valid .json format only
                </span>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={handleFileChange} 
                  disabled={restoring} 
                />
              </label>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
};

export default BackupSettings;
