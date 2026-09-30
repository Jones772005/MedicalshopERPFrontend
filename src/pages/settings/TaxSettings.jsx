import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import SettingsHeader from '../../components/settings/SettingsHeader';
import SettingsSection from '../../components/settings/SettingsSection';

const TaxSettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.tax || {});
  const [prevSettings, setPrevSettings] = useState(settings.tax);
  const [saving, setSaving] = useState(false);

  if (prevSettings !== settings.tax) {
    setPrevSettings(settings.tax);
    setFormData(settings.tax || {});
  }

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(settings.tax);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateCategorySettings('tax', formData);
    setSaving(false);
    alert('Tax settings saved successfully!');
  };

  return (
    <div>
      <SettingsHeader
        icon={Calculator}
        title="Tax & GST Settings"
        description="Configure global tax rates, pricing inclusivity, and auto round-off rules."
        onSave={handleSave}
        saving={saving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <div className="w-full space-y-6">
        <SettingsSection title="GST System Configuration">
          <div className="bg-[#F8FAFC] dark:bg-slate-800/40 p-4 rounded-xl border border-[#DDE6F0] dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="block text-sm font-bold text-[#162033] dark:text-white">
                Enable GST Tax System
              </span>
              <span className="block text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                Automatically calculates CGST and SGST on sales invoices and purchase bills
              </span>
            </div>
            <input
              type="checkbox"
              name="gstEnabled"
              checked={formData.gstEnabled || false}
              onChange={handleChange}
              className="h-5 w-5 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer"
            />
          </div>
        </SettingsSection>

        {formData.gstEnabled && (
          <SettingsSection title="Tax Rules & Rates">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white dark:bg-[#102A43] p-5 rounded-xl border border-[#DDE6F0] dark:border-slate-700/60">
              <div>
                <label htmlFor="defaultGstRate" className="block text-sm font-medium text-[#162033] dark:text-[#D9E6F2] mb-1">
                  Default GST Rate (%)
                </label>
                <select 
                  id="defaultGstRate"
                  name="defaultGstRate" 
                  value={formData.defaultGstRate ?? 12} 
                  onChange={handleChange} 
                  className="block w-full rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-2 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100 transition-colors"
                >
                  <option value="0">0% (Nil / Exempted)</option>
                  <option value="5">5% (Essential Drugs)</option>
                  <option value="12">12% (Standard Formulations)</option>
                  <option value="18">18% (General Healthcare)</option>
                  <option value="28">28% (Luxury / Cosmetic)</option>
                </select>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1.5">
                  Applied when a medicine does not have an item-specific GST rate specified.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <label className="flex items-start p-2.5 rounded-lg border border-[#DDE6F0] dark:border-slate-700/60 bg-[#F8FAFC] dark:bg-slate-800/40 cursor-pointer">
                  <input
                    type="checkbox"
                    name="taxInclusivePricing"
                    checked={formData.taxInclusivePricing || false}
                    onChange={handleChange}
                    className="h-4 w-4 mt-0.5 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer"
                  />
                  <div className="ml-3">
                    <span className="block text-xs font-bold text-[#162033] dark:text-white">
                      Tax Inclusive Pricing (MRP)
                    </span>
                    <span className="block text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                      Selling price already includes all applicable taxes
                    </span>
                  </div>
                </label>

                <label className="flex items-start p-2.5 rounded-lg border border-[#DDE6F0] dark:border-slate-700/60 bg-[#F8FAFC] dark:bg-slate-800/40 cursor-pointer">
                  <input
                    type="checkbox"
                    name="roundOff"
                    checked={formData.roundOff || false}
                    onChange={handleChange}
                    className="h-4 w-4 mt-0.5 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer"
                  />
                  <div className="ml-3">
                    <span className="block text-xs font-bold text-[#162033] dark:text-white">
                      Auto Round-Off Grand Total
                    </span>
                    <span className="block text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                      Automatically round bill amount to the nearest whole Rupee
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </SettingsSection>
        )}
      </div>
    </div>
  );
};

export default TaxSettings;
