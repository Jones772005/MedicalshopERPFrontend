import { useState, useEffect } from 'react';
import { Save, Barcode } from 'lucide-react';
import Button from '../../components/common/Button';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

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
    <Card className="m-6">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#DDE6F0] dark:border-[#263B50] pb-4">
        <div>
          <CardTitle className="flex items-center text-[#162033] dark:text-white">
            <Barcode className="w-5 h-5 mr-2 text-[#2482ED]" /> Barcode & Scanner Setup
          </CardTitle>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">Configure hardware scanner behavior in the POS screen.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="max-w-xl space-y-6">
        
        <div className="bg-white dark:bg-[#132B42] p-4 border border-[#DDE6F0] dark:border-[#263B50] rounded-xl space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="block text-sm font-bold text-[#162033] dark:text-white">Enable Barcode Scanning</span>
              <span className="block text-xs text-[#64748B] dark:text-slate-400">Allow scanning medicines in billing and inventory</span>
            </div>
            <input
              type="checkbox"
              name="enabled"
              checked={formData.enabled}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]"
            />
          </label>
        </div>

        {formData.enabled && (
          <div className="bg-white dark:bg-[#132B42] p-5 border border-[#DDE6F0] dark:border-[#263B50] rounded-xl space-y-5">
            <h3 className="text-sm font-bold text-[#162033] dark:text-white mb-2">Scanner Behavior</h3>
            
            <label className="flex items-center">
              <input type="checkbox" name="autoFocus" checked={formData.autoFocus} onChange={handleChange} className="form-checkbox h-4 w-4 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]" />
              <div className="ml-3">
                <span className="block text-sm text-[#162033] dark:text-white">Auto-focus scan input</span>
                <span className="block text-xs text-[#64748B] dark:text-slate-400">Keeps the cursor in the search box automatically</span>
              </div>
            </label>
            
            <label className="flex items-center">
              <input type="checkbox" name="autoAddScanned" checked={formData.autoAddScanned} onChange={handleChange} className="form-checkbox h-4 w-4 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]" />
              <div className="ml-3">
                <span className="block text-sm text-[#162033] dark:text-white">Auto-add on successful scan</span>
                <span className="block text-xs text-[#64748B] dark:text-slate-400">Add 1 unit to cart immediately when barcode is recognized</span>
              </div>
            </label>

            <label className="flex items-center">
              <input type="checkbox" name="showOnInvoice" checked={formData.showOnInvoice} onChange={handleChange} className="form-checkbox h-4 w-4 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]" />
              <div className="ml-3">
                <span className="block text-sm text-[#162033] dark:text-white">Print Invoice Barcode</span>
                <span className="block text-xs text-[#64748B] dark:text-slate-400">Generate a barcode of the invoice number on receipts</span>
              </div>
            </label>

            <div className="pt-4 border-t border-[#DDE6F0] dark:border-[#263B50] mt-2">
              <label className="block text-sm font-bold text-[#64748B] dark:text-slate-300 mb-1">Generated Barcode Format</label>
              <select 
                name="format" 
                value={formData.format} 
                onChange={handleChange}
                className="block w-full rounded-md border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#0B1A2A] px-3 py-2 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-1 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100"
              >
                <option value="CODE-128">Code-128 (Standard)</option>
                <option value="CODE-39">Code-39</option>
                <option value="EAN-13">EAN-13 (Retail Product)</option>
              </select>
            </div>
          </div>
        )}

      </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeSettings;
