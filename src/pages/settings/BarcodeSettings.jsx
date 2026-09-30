import { useState } from 'react';
import { Barcode } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import SettingsHeader from '../../components/settings/SettingsHeader';
import SettingsSection from '../../components/settings/SettingsSection';

const BarcodeSettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.barcode || {});
  const [prevSettings, setPrevSettings] = useState(settings.barcode);
  const [saving, setSaving] = useState(false);

  if (prevSettings !== settings.barcode) {
    setPrevSettings(settings.barcode);
    setFormData(settings.barcode || {});
  }

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(settings.barcode);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateCategorySettings('barcode', formData);
    setSaving(false);
    alert('Barcode settings saved successfully!');
  };

  return (
    <div>
      <SettingsHeader
        icon={Barcode}
        title="Barcode & Scanner Setup"
        description="Configure hardware barcode scanner behavior, scanning autofocus, and barcode label formats."
        onSave={handleSave}
        saving={saving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <div className="w-full space-y-6">
        <SettingsSection title="Barcode Module Activation">
          <div className="bg-[#F8FAFC] dark:bg-slate-800/40 p-4 rounded-xl border border-[#DDE6F0] dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="block text-sm font-bold text-[#162033] dark:text-white">
                Enable Barcode Scanner Integration
              </span>
              <span className="block text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                Enables hardware USB/Bluetooth barcode scanner inputs across billing and inventory management
              </span>
            </div>
            <input
              type="checkbox"
              name="enabled"
              checked={formData.enabled || false}
              onChange={handleChange}
              className="h-5 w-5 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer"
            />
          </div>
        </SettingsSection>

        {formData.enabled && (
          <SettingsSection title="Scanner Automation & Formats">
            <div className="bg-white dark:bg-[#102A43] p-5 border border-[#DDE6F0] dark:border-slate-700/60 rounded-xl space-y-4">
              <div className="space-y-3">
                <label className="flex items-start p-2.5 rounded-lg border border-[#DDE6F0] dark:border-slate-700/60 bg-[#F8FAFC] dark:bg-slate-800/40 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="autoFocus" 
                    checked={formData.autoFocus || false} 
                    onChange={handleChange} 
                    className="h-4 w-4 mt-0.5 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                  />
                  <div className="ml-3">
                    <span className="block text-xs font-bold text-[#162033] dark:text-white">
                      Auto-focus search input
                    </span>
                    <span className="block text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                      Maintains focus on the search / scan field when opening billing screens
                    </span>
                  </div>
                </label>
                
                <label className="flex items-start p-2.5 rounded-lg border border-[#DDE6F0] dark:border-slate-700/60 bg-[#F8FAFC] dark:bg-slate-800/40 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="autoAddScanned" 
                    checked={formData.autoAddScanned || false} 
                    onChange={handleChange} 
                    className="h-4 w-4 mt-0.5 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                  />
                  <div className="ml-3">
                    <span className="block text-xs font-bold text-[#162033] dark:text-white">
                      Auto-add item on scan
                    </span>
                    <span className="block text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                      Automatically add 1 unit to cart immediately when a matched medicine barcode is read
                    </span>
                  </div>
                </label>

                <label className="flex items-start p-2.5 rounded-lg border border-[#DDE6F0] dark:border-slate-700/60 bg-[#F8FAFC] dark:bg-slate-800/40 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="showOnInvoice" 
                    checked={formData.showOnInvoice || false} 
                    onChange={handleChange} 
                    className="h-4 w-4 mt-0.5 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                  />
                  <div className="ml-3">
                    <span className="block text-xs font-bold text-[#162033] dark:text-white">
                      Print invoice barcode on receipts
                    </span>
                    <span className="block text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                      Renders a 1D barcode of the invoice number for fast return retrieval
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-[#DDE6F0] dark:border-slate-700/60">
                <label htmlFor="barcodeFormat" className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-300 mb-1.5">
                  Generated Barcode Symbology
                </label>
                <select 
                  id="barcodeFormat"
                  name="format" 
                  value={formData.format || 'CODE-128'} 
                  onChange={handleChange} 
                  className="block w-full rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-2 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100 transition-colors"
                >
                  <option value="CODE-128">Code-128 (High Density - Recommended)</option>
                  <option value="CODE-39">Code-39 (Alphanumeric)</option>
                  <option value="EAN-13">EAN-13 (Standard Retail Packaging)</option>
                </select>
              </div>
            </div>
          </SettingsSection>
        )}
      </div>
    </div>
  );
};

export default BarcodeSettings;
