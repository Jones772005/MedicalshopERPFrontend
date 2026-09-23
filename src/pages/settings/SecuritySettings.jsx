import { useState, useEffect } from 'react';
import { Save, Shield } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

const SecuritySettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.security);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    setFormData(settings.security);
  }, [settings.security]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateCategorySettings('security', formData);
    setSaving(false);
    alert('Security settings saved successfully!');
  };

  return (
    <Card className="m-6">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#DDE6F0] dark:border-[#263B50] pb-4">
        <div>
          <CardTitle className="flex items-center text-[#162033] dark:text-white">
            <Shield className="w-5 h-5 mr-2 text-[#2482ED]" /> Security & Access Controls
          </CardTitle>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">Configure global security policies for the ERP.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#132B42] p-5 border border-[#DDE6F0] dark:border-[#263B50] rounded-xl">
            <h3 className="text-sm font-bold text-[#162033] dark:text-white mb-4">Password Policy</h3>
            <div className="space-y-4">
              <Input label="Minimum Password Length" type="number" name="minPasswordLength" value={formData.minPasswordLength} onChange={handleChange} />
              <Input label="Password Expiry (Days)" type="number" name="passwordExpiryDays" value={formData.passwordExpiryDays} onChange={handleChange} />
              
              <label className="flex items-center mt-2">
                <input type="checkbox" name="requireStrongPassword" checked={formData.requireStrongPassword} onChange={handleChange} className="form-checkbox h-4 w-4 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]" />
                <span className="ml-3 text-sm text-[#162033] dark:text-gray-300">Require Special Characters & Numbers</span>
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-[#132B42] p-5 border border-[#DDE6F0] dark:border-[#263B50] rounded-xl">
            <h3 className="text-sm font-bold text-[#162033] dark:text-white mb-4">Operational Security</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" name="requireRxVerification" checked={formData.requireRxVerification} onChange={handleChange} className="form-checkbox h-4 w-4 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]" />
                <span className="ml-3 text-sm text-[#162033] dark:text-gray-300">Require Pharmacist to verify H1/Schedule X Prescriptions</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" name="requireManagerForDiscount" checked={formData.requireManagerForDiscount} onChange={handleChange} className="form-checkbox h-4 w-4 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]" />
                <span className="ml-3 text-sm text-[#162033] dark:text-gray-300">Require Manager PIN for discounts &gt; 15%</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" name="requireManagerForStockAdjust" checked={formData.requireManagerForStockAdjust} onChange={handleChange} className="form-checkbox h-4 w-4 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]" />
                <span className="ml-3 text-sm text-[#162033] dark:text-gray-300">Require Manager PIN for manual stock adjustments</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#132B42] p-5 border border-[#DDE6F0] dark:border-[#263B50] rounded-xl">
            <h3 className="text-sm font-bold text-[#162033] dark:text-white mb-4">Session Management</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input label="Session Timeout (Minutes)" type="number" name="sessionTimeoutMinutes" value={formData.sessionTimeoutMinutes} onChange={handleChange} />
              <Input label="Max Concurrent Logins" type="number" name="maxConcurrentSessions" value={formData.maxConcurrentSessions} onChange={handleChange} />
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" name="autoLogout" checked={formData.autoLogout} onChange={handleChange} className="form-checkbox h-4 w-4 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]" />
                <span className="ml-3 text-sm text-[#162033] dark:text-gray-300">Auto-logout on inactivity timeout</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="form-checkbox h-4 w-4 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]" />
                <span className="ml-3 text-sm text-[#162033] dark:text-gray-300">Allow "Remember Me" on login screen</span>
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-[#132B42] p-5 border border-[#DDE6F0] dark:border-[#263B50] rounded-xl border-l-4 border-l-red-500 dark:border-l-red-500">
            <h3 className="text-sm font-bold text-[#162033] dark:text-white mb-4">Brute Force Protection</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Max Failed Attempts" type="number" name="maxFailedAttempts" value={formData.maxFailedAttempts} onChange={handleChange} />
              <Input label="Account Lockout Duration (Min)" type="number" name="lockDurationMinutes" value={formData.lockDurationMinutes} onChange={handleChange} />
            </div>
          </div>
        </div>

      </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
