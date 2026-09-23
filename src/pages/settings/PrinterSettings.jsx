import { useState, useEffect } from 'react';
import { Save, Printer } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

const PrinterSettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.printer);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    setFormData(settings.printer);
  }, [settings.printer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateCategorySettings('printer', formData);
    setSaving(false);
    alert('Printer settings saved successfully!');
  };

  return (
    <Card className="m-6">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#DDE6F0] dark:border-[#263B50] pb-4">
        <div>
          <CardTitle className="flex items-center text-[#162033] dark:text-white">
            <Printer className="w-5 h-5 mr-2 text-[#2482ED]" /> POS Printer Configuration
          </CardTitle>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">Configure hardware printer settings for billing.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#64748B] dark:text-slate-300 mb-1">Active Printer</label>
            <select 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              className="block w-full rounded-md border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#0B1A2A] px-3 py-2 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-1 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100"
            >
              <option value="EPSON TM-T82 Thermal Printer">EPSON TM-T82 Thermal Printer (USB)</option>
              <option value="TVS RP3160 Thermal Printer">TVS RP3160 Thermal Printer (LAN)</option>
              <option value="HP LaserJet Pro">HP LaserJet Pro (A4)</option>
              <option value="PDF Export">Print to PDF (Virtual)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#64748B] dark:text-slate-300 mb-1">Printer Type</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange}
                className="block w-full rounded-md border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#0B1A2A] px-3 py-2 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-1 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100"
              >
                <option value="Thermal">Thermal POS</option>
                <option value="Laser">Laser/Inkjet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#64748B] dark:text-slate-300 mb-1">Paper Size</label>
              <select 
                name="paperSize" 
                value={formData.paperSize} 
                onChange={handleChange}
                className="block w-full rounded-md border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#0B1A2A] px-3 py-2 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-1 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100"
              >
                <option value="80mm">80mm (3.14 inch)</option>
                <option value="58mm">58mm (2.28 inch)</option>
                <option value="A4">A4 Size</option>
                <option value="A5">A5 Size</option>
              </select>
            </div>
          </div>

          <Input label="Default Copies" type="number" name="copies" value={formData.copies} onChange={handleChange} min="1" max="5" />
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold text-[#162033] dark:text-white">Automation Rules</h3>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" name="autoPrintInvoice" checked={formData.autoPrintInvoice} onChange={handleChange} className="form-checkbox h-4 w-4 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]" />
              <span className="ml-3 text-sm text-[#162033] dark:text-gray-300">Auto-print invoice after successful payment</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="autoPrintReceipt" checked={formData.autoPrintReceipt} onChange={handleChange} className="form-checkbox h-4 w-4 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]" />
              <span className="ml-3 text-sm text-[#162033] dark:text-gray-300">Auto-print payment receipt for partial payments</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="printPreview" checked={formData.printPreview} onChange={handleChange} className="form-checkbox h-4 w-4 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]" />
              <span className="ml-3 text-sm text-[#162033] dark:text-gray-300">Show browser print preview before printing</span>
            </label>
          </div>

          <div className="mt-8 pt-6 border-t border-[#DDE6F0] dark:border-[#263B50]">
            <Button variant="outline" className="w-full justify-center" onClick={() => alert("Printing test page...")}>
              Print Test Page
            </Button>
          </div>
        </div>

      </div>
      </CardContent>
    </Card>
  );
};

export default PrinterSettings;
