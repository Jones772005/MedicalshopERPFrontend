import { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

const InvoiceSettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.invoice);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    setFormData(settings.invoice);
  }, [settings.invoice]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateCategorySettings('invoice', formData);
    setSaving(false);
    alert('Invoice settings saved successfully!');
  };

  return (
    <Card className="m-6">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#DDE6F0] dark:border-[#263B50] pb-4">
        <div>
          <CardTitle className="flex items-center text-[#162033] dark:text-white">
            <FileText className="w-5 h-5 mr-2 text-[#2482ED]" /> Invoice Settings
          </CardTitle>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">Configure invoice numbering and display preferences.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-[#162033] dark:text-white">Numbering System</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Invoice Prefix" name="prefix" value={formData.prefix} onChange={handleChange} required />
            <Input label="Starting Number" type="number" name="startingNumber" value={formData.startingNumber} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#64748B] dark:text-slate-300 mb-1">Number Format</label>
            <select name="format" value={formData.format} onChange={handleChange} className="block w-full rounded-md border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#0B1A2A] px-3 py-2 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-1 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100">
              <option value="PREFIX-NUMBER">PREFIX-NUMBER (e.g. INV-1001)</option>
              <option value="PREFIX-YEAR-NUMBER">PREFIX-YEAR-NUMBER (e.g. INV-2024-1001)</option>
              <option value="NUMBER">NUMBER (e.g. 1001)</option>
            </select>
          </div>
          
          <div className="pt-4 border-t border-[#DDE6F0] dark:border-[#263B50]">
            <label className="block text-sm font-bold text-[#64748B] dark:text-slate-300 mb-2">Footer / Terms & Conditions</label>
            <textarea 
              name="footerText" 
              rows={4} 
              value={formData.footerText} 
              onChange={handleChange}
              className="block w-full rounded-md border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#0B1A2A] px-3 py-2 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-1 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100"
            ></textarea>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold text-[#162033] dark:text-white">Display Preferences</h3>
          
          <div className="space-y-3">
            {[
              { id: 'showLogo', label: 'Show Pharmacy Logo' },
              { id: 'showCustomerInfo', label: 'Show Customer Information' },
              { id: 'showHsnSac', label: 'Show HSN/SAC Codes' },
              { id: 'showGstBreakdown', label: 'Show Detailed GST Breakdown' },
              { id: 'showTerms', label: 'Show Terms & Conditions' },
              { id: 'showQrCode', label: 'Show Review/Payment QR Code' }
            ].map((toggle) => (
              <label key={toggle.id} className="flex items-center">
                <input
                  type="checkbox"
                  name={toggle.id}
                  checked={formData[toggle.id]}
                  onChange={handleChange}
                  className="form-checkbox h-4 w-4 text-[#2482ED] border-[#DDE6F0] rounded focus:ring-[#2482ED] dark:border-[#263B50] dark:bg-[#0B1A2A]"
                />
                <span className="ml-3 text-sm text-[#162033] dark:text-gray-300">{toggle.label}</span>
              </label>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800 mt-6">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-1">Preview Notice</h4>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Changes to invoice settings will immediately affect all future invoices printed from the POS system. Existing invoices in history will retain their original formatting if already printed.
            </p>
          </div>
        </div>

      </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceSettings;
