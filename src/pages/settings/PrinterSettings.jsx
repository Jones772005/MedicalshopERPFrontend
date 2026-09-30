import { useState } from 'react';
import { Printer } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useSettings } from '../../context/SettingsContext';
import SettingsHeader from '../../components/settings/SettingsHeader';
import SettingsSection from '../../components/settings/SettingsSection';

const PrinterSettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.printer || {});
  const [prevSettings, setPrevSettings] = useState(settings.printer);
  const [saving, setSaving] = useState(false);

  if (prevSettings !== settings.printer) {
    setPrevSettings(settings.printer);
    setFormData(settings.printer || {});
  }

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(settings.printer);

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
    <div>
      <SettingsHeader
        icon={Printer}
        title="POS Printer Configuration"
        description="Configure hardware thermal receipt printers, paper sizing, and print automations."
        onSave={handleSave}
        saving={saving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Left Column: Printer Hardware */}
        <div className="space-y-6">
          <SettingsSection title="Hardware Configuration">
            <div className="space-y-4">
              <div>
                <label htmlFor="printerName" className="block text-sm font-medium text-[#162033] dark:text-[#D9E6F2] mb-1">
                  Active Thermal / Document Printer
                </label>
                <select 
                  id="printerName"
                  name="name" 
                  value={formData.name || 'EPSON TM-T82 Thermal Printer'} 
                  onChange={handleChange} 
                  className="block w-full rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-2 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100 transition-colors"
                >
                  <option value="EPSON TM-T82 Thermal Printer">EPSON TM-T82 Thermal Printer (USB)</option>
                  <option value="TVS RP3160 Thermal Printer">TVS RP3160 Thermal Printer (LAN / Network)</option>
                  <option value="HP LaserJet Pro">HP LaserJet Pro (Standard A4)</option>
                  <option value="PDF Export">Print to PDF (Virtual / Digital)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="printerType" className="block text-sm font-medium text-[#162033] dark:text-[#D9E6F2] mb-1">
                    Printer Type
                  </label>
                  <select 
                    id="printerType"
                    name="type" 
                    value={formData.type || 'Thermal'} 
                    onChange={handleChange} 
                    className="block w-full rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-2 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100 transition-colors"
                  >
                    <option value="Thermal">Thermal POS</option>
                    <option value="Laser">Laser / Inkjet</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="paperSize" className="block text-sm font-medium text-[#162033] dark:text-[#D9E6F2] mb-1">
                    Paper Size
                  </label>
                  <select 
                    id="paperSize"
                    name="paperSize" 
                    value={formData.paperSize || '80mm'} 
                    onChange={handleChange} 
                    className="block w-full rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-2 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100 transition-colors"
                  >
                    <option value="80mm">80mm (3.14 inch - Standard)</option>
                    <option value="58mm">58mm (2.28 inch - Compact)</option>
                    <option value="A4">A4 Full Sheet</option>
                    <option value="A5">A5 Half Sheet</option>
                  </select>
                </div>
              </div>

              <div>
                <Input 
                  label="Default Number of Copies" 
                  type="number" 
                  name="copies" 
                  value={formData.copies ?? 1} 
                  onChange={handleChange} 
                  min="1" 
                  max="5" 
                />
              </div>
            </div>
          </SettingsSection>
        </div>

        {/* Right Column: Automation Rules & Test Print */}
        <div className="space-y-6">
          <SettingsSection title="Printing Automation Rules">
            <div className="space-y-2.5 bg-[#F8FAFC] dark:bg-slate-800/40 p-4 rounded-xl border border-[#DDE6F0] dark:border-slate-700/60">
              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <div>
                  <span className="text-xs sm:text-sm font-medium text-[#162033] dark:text-slate-200 block">
                    Auto-print invoice on checkout
                  </span>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                    Immediately send job to printer after sale completion
                  </span>
                </div>
                <input 
                  type="checkbox" 
                  name="autoPrintInvoice" 
                  checked={formData.autoPrintInvoice || false} 
                  onChange={handleChange} 
                  className="h-4 w-4 rounded text-[#2482ED] border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <div>
                  <span className="text-xs sm:text-sm font-medium text-[#162033] dark:text-slate-200 block">
                    Auto-print receipt for partial payments
                  </span>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                    Print mini payment receipt when advance is accepted
                  </span>
                </div>
                <input 
                  type="checkbox" 
                  name="autoPrintReceipt" 
                  checked={formData.autoPrintReceipt || false} 
                  onChange={handleChange} 
                  className="h-4 w-4 rounded text-[#2482ED] border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <div>
                  <span className="text-xs sm:text-sm font-medium text-[#162033] dark:text-slate-200 block">
                    Show browser print preview dialog
                  </span>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                    Display preview modal before sending to spooler
                  </span>
                </div>
                <input 
                  type="checkbox" 
                  name="printPreview" 
                  checked={formData.printPreview || false} 
                  onChange={handleChange} 
                  className="h-4 w-4 rounded text-[#2482ED] border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                />
              </label>
            </div>
          </SettingsSection>

          <SettingsSection title="Hardware Diagnostics">
            <div className="bg-[#F8FAFC] dark:bg-slate-800/40 p-4 rounded-xl border border-[#DDE6F0] dark:border-slate-700/60">
              <p className="text-xs text-[#64748B] dark:text-slate-400 mb-3">
                Send a sample test print job with current alignment, character set, and paper cut command to verify connectivity.
              </p>
              <Button 
                type="button"
                variant="outline" 
                className="w-full justify-center h-10 text-xs font-semibold shadow-xs" 
                onClick={() => alert("Printing test page...")}
              >
                <Printer className="w-3.5 h-3.5 mr-2" />
                Print Test Receipt
              </Button>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
};

export default PrinterSettings;
