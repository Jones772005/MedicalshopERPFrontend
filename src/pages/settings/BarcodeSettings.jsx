import { useState, useEffect } from 'react';
import { Save, Barcode } from 'lucide-react';
import Button from '../../components/common/Button';
import { useSettings } from '../../context/SettingsContext';

const BarcodeSettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.barcode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    setFormData(settings.barcode);
  }, [settings.barcode]);

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
    <div className="p-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Barcode className="w-5 h-5 mr-2 text-primary-500" /> Barcode & Scanner Setup
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure hardware scanner behavior in the POS screen.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="max-w-xl space-y-6">
        
        <div className="bg-white dark:bg-slate-800 p-4 border border-gray-200 dark:border-slate-700 rounded-lg space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="block text-sm font-medium text-gray-900 dark:text-white">Enable Barcode Scanning</span>
              <span className="block text-xs text-gray-500 dark:text-slate-400">Allow scanning medicines in billing and inventory</span>
            </div>
            <input
              type="checkbox"
              name="enabled"
              checked={formData.enabled}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
            />
          </label>
        </div>

        {formData.enabled && (
          <div className="bg-white dark:bg-slate-800 p-5 border border-gray-200 dark:border-slate-700 rounded-lg space-y-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Scanner Behavior</h3>
            
            <label className="flex items-center">
              <input type="checkbox" name="autoFocus" checked={formData.autoFocus} onChange={handleChange} className="form-checkbox h-4 w-4 text-primary-600 rounded" />
              <div className="ml-3">
                <span className="block text-sm text-gray-900 dark:text-white">Auto-focus scan input</span>
                <span className="block text-xs text-gray-500 dark:text-slate-400">Keeps the cursor in the search box automatically</span>
              </div>
            </label>
            
            <label className="flex items-center">
              <input type="checkbox" name="autoAddScanned" checked={formData.autoAddScanned} onChange={handleChange} className="form-checkbox h-4 w-4 text-primary-600 rounded" />
              <div className="ml-3">
                <span className="block text-sm text-gray-900 dark:text-white">Auto-add on successful scan</span>
                <span className="block text-xs text-gray-500 dark:text-slate-400">Add 1 unit to cart immediately when barcode is recognized</span>
              </div>
            </label>

            <label className="flex items-center">
              <input type="checkbox" name="showOnInvoice" checked={formData.showOnInvoice} onChange={handleChange} className="form-checkbox h-4 w-4 text-primary-600 rounded" />
              <div className="ml-3">
                <span className="block text-sm text-gray-900 dark:text-white">Print Invoice Barcode</span>
                <span className="block text-xs text-gray-500 dark:text-slate-400">Generate a barcode of the invoice number on receipts</span>
              </div>
            </label>

            <div className="pt-4 border-t border-gray-100 dark:border-slate-700 mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Generated Barcode Format</label>
              <select 
                name="format" 
                value={formData.format} 
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
              >
                <option value="CODE-128">Code-128 (Standard)</option>
                <option value="CODE-39">Code-39</option>
                <option value="EAN-13">EAN-13 (Retail Product)</option>
              </select>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BarcodeSettings;
