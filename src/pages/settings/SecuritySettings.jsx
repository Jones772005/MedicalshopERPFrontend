import { useState } from 'react';
import { Shield } from 'lucide-react';
import Input from '../../components/common/Input';
import { useSettings } from '../../context/SettingsContext';
import SettingsHeader from '../../components/settings/SettingsHeader';
import SettingsSection from '../../components/settings/SettingsSection';

const SecuritySettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.security || {});
  const [prevSettings, setPrevSettings] = useState(settings.security);
  const [saving, setSaving] = useState(false);

  if (prevSettings !== settings.security) {
    setPrevSettings(settings.security);
    setFormData(settings.security || {});
  }

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(settings.security);

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
    <div>
      <SettingsHeader
        icon={Shield}
        title="Security & Access Controls"
        description="Configure password requirements, operational authorization rules, and session lifecycle policies."
        onSave={handleSave}
        saving={saving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Left Column: Password & Operational Security */}
        <div className="space-y-6">
          <SettingsSection title="Password Policy">
            <div className="bg-[#F8FAFC] dark:bg-slate-800/40 p-4 rounded-xl border border-[#DDE6F0] dark:border-slate-700/60 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Minimum Password Length" 
                  type="number" 
                  name="minPasswordLength" 
                  value={formData.minPasswordLength || 8} 
                  onChange={handleChange} 
                  min="6"
                  max="32"
                />
                <Input 
                  label="Password Expiry (Days)" 
                  type="number" 
                  name="passwordExpiryDays" 
                  value={formData.passwordExpiryDays || 90} 
                  onChange={handleChange} 
                />
              </div>
              
              <label className="flex items-center p-2.5 rounded-lg border border-[#DDE6F0] dark:border-slate-700/60 bg-white dark:bg-[#102A43] cursor-pointer">
                <input 
                  type="checkbox" 
                  name="requireStrongPassword" 
                  checked={formData.requireStrongPassword || false} 
                  onChange={handleChange} 
                  className="h-4 w-4 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                />
                <span className="ml-3 text-xs sm:text-sm font-medium text-[#162033] dark:text-slate-200">
                  Require alphanumeric, uppercase & special symbols
                </span>
              </label>
            </div>
          </SettingsSection>

          <SettingsSection title="Operational Authorizations">
            <div className="bg-[#F8FAFC] dark:bg-slate-800/40 p-4 rounded-xl border border-[#DDE6F0] dark:border-slate-700/60 space-y-2.5">
              <label className="flex items-start p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <input 
                  type="checkbox" 
                  name="requireRxVerification" 
                  checked={formData.requireRxVerification || false} 
                  onChange={handleChange} 
                  className="h-4 w-4 mt-0.5 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                />
                <div className="ml-3">
                  <span className="block text-xs sm:text-sm font-medium text-[#162033] dark:text-slate-200">
                    Mandatory Prescription Check
                  </span>
                  <span className="block text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                    Require cashier verification check before billing Schedule H / H1 / X drugs
                  </span>
                </div>
              </label>

              <label className="flex items-start p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <input 
                  type="checkbox" 
                  name="requireManagerForDiscount" 
                  checked={formData.requireManagerForDiscount || false} 
                  onChange={handleChange} 
                  className="h-4 w-4 mt-0.5 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                />
                <div className="ml-3">
                  <span className="block text-xs sm:text-sm font-medium text-[#162033] dark:text-slate-200">
                    Manager Override for High Discounts
                  </span>
                  <span className="block text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                    Prompt for Manager PIN if bill discount exceeds 15%
                  </span>
                </div>
              </label>

              <label className="flex items-start p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <input 
                  type="checkbox" 
                  name="requireManagerForStockAdjust" 
                  checked={formData.requireManagerForStockAdjust || false} 
                  onChange={handleChange} 
                  className="h-4 w-4 mt-0.5 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                />
                <div className="ml-3">
                  <span className="block text-xs sm:text-sm font-medium text-[#162033] dark:text-slate-200">
                    Manager Authorization for Stock Adjustments
                  </span>
                  <span className="block text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                    Require supervisor credentials before writing off damaged inventory
                  </span>
                </div>
              </label>
            </div>
          </SettingsSection>
        </div>

        {/* Right Column: Session & Brute Force */}
        <div className="space-y-6">
          <SettingsSection title="Session Management">
            <div className="bg-[#F8FAFC] dark:bg-slate-800/40 p-4 rounded-xl border border-[#DDE6F0] dark:border-slate-700/60 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Session Inactivity Timeout (Min)" 
                  type="number" 
                  name="sessionTimeoutMinutes" 
                  value={formData.sessionTimeoutMinutes || 60} 
                  onChange={handleChange} 
                />
                <Input 
                  label="Max Concurrent Logins" 
                  type="number" 
                  name="maxConcurrentSessions" 
                  value={formData.maxConcurrentSessions || 3} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2 pt-1">
                <label className="flex items-center p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="autoLogout" 
                    checked={formData.autoLogout || false} 
                    onChange={handleChange} 
                    className="h-4 w-4 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                  />
                  <span className="ml-3 text-xs sm:text-sm font-medium text-[#162033] dark:text-slate-200">
                    Auto-logout cashier upon prolonged inactivity
                  </span>
                </label>

                <label className="flex items-center p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="rememberMe" 
                    checked={formData.rememberMe || false} 
                    onChange={handleChange} 
                    className="h-4 w-4 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                  />
                  <span className="ml-3 text-xs sm:text-sm font-medium text-[#162033] dark:text-slate-200">
                    Allow "Remember Me" credential preservation on sign-in
                  </span>
                </label>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Brute Force Protection">
            <div className="bg-[#F8FAFC] dark:bg-slate-800/40 p-4 rounded-xl border-l-4 border-l-red-500 border border-[#DDE6F0] dark:border-slate-700/60 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Max Failed Login Attempts" 
                  type="number" 
                  name="maxFailedAttempts" 
                  value={formData.maxFailedAttempts || 5} 
                  onChange={handleChange} 
                />
                <Input 
                  label="Account Lockout Duration (Min)" 
                  type="number" 
                  name="lockDurationMinutes" 
                  value={formData.lockDurationMinutes || 15} 
                  onChange={handleChange} 
                />
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                Accounts with consecutive incorrect password entries will be automatically frozen for the specified cooldown duration.
              </p>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
