import { useState, useEffect } from 'react';
import { Save, Calculator } from 'lucide-react';
import Button from '../../components/common/Button';
import { useSettings } from '../../context/SettingsContext';

const TaxSettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.tax);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    setFormData(settings.tax);
  }, [settings.tax]);

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
    <div className="p-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Calculator className="w-5 h-5 mr-2 text-primary-500" /> Tax & GST Settings
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure global tax calculation methods.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        
        <div className="bg-white dark:bg-slate-800 p-4 border border-gray-200 dark:border-slate-700 rounded-lg space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="block text-sm font-medium text-gray-900 dark:text-white">Enable GST System</span>
              <span className="block text-xs text-gray-500 dark:text-slate-400">Turn on to calculate CGST and SGST on invoices</span>
            </div>
            <input
              type="checkbox"
              name="gstEnabled"
              checked={formData.gstEnabled}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
            />
          </label>
        </div>

        {formData.gstEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default GST Rate (%)</label>
              <select 
                name="defaultGstRate" 
                value={formData.defaultGstRate} 
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">This rate applies if a specific medicine has no GST defined.</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="taxInclusivePricing"
                  checked={formData.taxInclusivePricing}
                  onChange={handleChange}
                  className="form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900 dark:text-white">Tax Inclusive Pricing</span>
                  <span className="block text-xs text-gray-500 dark:text-slate-400">Is MRP inclusive of taxes?</span>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="roundOff"
                  checked={formData.roundOff}
                  onChange={handleChange}
                  className="form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900 dark:text-white">Auto Round-Off</span>
                  <span className="block text-xs text-gray-500 dark:text-slate-400">Round invoice totals to nearest Rupee</span>
                </div>
              </label>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TaxSettings;
