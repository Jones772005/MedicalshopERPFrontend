import { useState } from 'react';
import { FileText, Info } from 'lucide-react';
import Input from '../../components/common/Input';
import { useSettings } from '../../context/SettingsContext';
import SettingsHeader from '../../components/settings/SettingsHeader';
import SettingsSection from '../../components/settings/SettingsSection';

const InvoiceSettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.invoice || {});
  const [prevSettings, setPrevSettings] = useState(settings.invoice);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);

  if (prevSettings !== settings.invoice) {
    setPrevSettings(settings.invoice);
    setFormData(settings.invoice || {});
  }

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(settings.invoice);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.prefix?.trim()) {
      errs.prefix = 'Invoice prefix is required';
    }
    const startingNum = Number(formData.startingNumber);
    if (!formData.startingNumber || isNaN(startingNum) || startingNum < 1) {
      errs.startingNumber = 'Starting number must be at least 1';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    setStatusMessage(null);
    if (!validate()) return;
    setSaving(true);
    await updateCategorySettings('invoice', formData);
    setSaving(false);
    setStatusMessage({ type: 'success', text: 'Invoice settings saved successfully!' });
  };

  const displayToggles = [
    { id: 'showLogo', label: 'Show Pharmacy Logo on Header' },
    { id: 'showCustomerInfo', label: 'Show Customer Name & Phone Number' },
    { id: 'showHsnSac', label: 'Show HSN / SAC Codes in Item Table' },
    { id: 'showGstBreakdown', label: 'Show Detailed GST Tax Breakdown' },
    { id: 'showTerms', label: 'Show Terms & Conditions / Footer Note' },
    { id: 'showQrCode', label: 'Show Payment & Feedback QR Code' }
  ];

  return (
    <div>
      <SettingsHeader
        icon={FileText}
        title="Invoice Settings"
        description="Configure invoice numbering system, layout, and display preferences."
        onSave={handleSave}
        saving={saving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {statusMessage && (
        <div className={`mb-6 p-4 rounded-lg border text-sm ${
          statusMessage.type === 'error'
            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
            : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
        }`}>
          {statusMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Numbering & Terms */}
        <div className="space-y-6">
          <SettingsSection title="Numbering System">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Invoice Prefix" 
                name="prefix" 
                value={formData.prefix || ''} 
                onChange={handleChange} 
                required 
                error={errors.prefix}
              />
              <Input 
                label="Starting Number" 
                type="number" 
                min="1"
                name="startingNumber" 
                value={formData.startingNumber || ''} 
                onChange={handleChange} 
                required 
                error={errors.startingNumber}
              />
            </div>
            <div>
              <label htmlFor="formatSelect" className="block text-sm font-medium text-[#162033] dark:text-[#D9E6F2] mb-1">
                Number Format
              </label>
              <select 
                id="formatSelect"
                name="format" 
                value={formData.format || 'PREFIX-NUMBER'} 
                onChange={handleChange} 
                className="block w-full rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-2 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100 transition-colors"
              >
                <option value="PREFIX-NUMBER">PREFIX-NUMBER (e.g. INV-1001)</option>
                <option value="PREFIX-YEAR-NUMBER">PREFIX-YEAR-NUMBER (e.g. INV-2026-1001)</option>
                <option value="NUMBER">NUMBER ONLY (e.g. 1001)</option>
              </select>
            </div>
          </SettingsSection>

          <SettingsSection title="Footer / Terms & Conditions">
            <div>
              <textarea 
                name="footerText" 
                rows={4} 
                value={formData.footerText || ''} 
                onChange={handleChange}
                placeholder="Enter standard disclaimer or thank you note..."
                className="block w-full rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2.5 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-2 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100 transition-colors"
              ></textarea>
            </div>
          </SettingsSection>
        </div>

        {/* Right Column: Display Preferences & Preview Notice */}
        <div className="space-y-6">
          <SettingsSection title="Display Preferences">
            <div className="space-y-2.5 bg-[#F8FAFC] dark:bg-slate-800/40 p-4 rounded-xl border border-[#DDE6F0] dark:border-slate-700/60">
              {displayToggles.map((toggle) => (
                <label 
                  key={toggle.id} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-medium text-[#162033] dark:text-slate-200">
                    {toggle.label}
                  </span>
                  <input
                    type="checkbox"
                    name={toggle.id}
                    checked={formData[toggle.id] || false}
                    onChange={handleChange}
                    className="h-4 w-4 rounded text-[#2482ED] border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </SettingsSection>

          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-start space-x-3">
            <Info className="w-5 h-5 text-[#2482ED] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-300 space-y-1">
              <span className="font-bold block">POS Integration Note</span>
              <p className="text-blue-800/80 dark:text-blue-400">
                Changes to invoice settings will immediately reflect on all future bills generated and printed from the POS billing counter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSettings;
