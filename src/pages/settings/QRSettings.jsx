import { useState, useEffect } from 'react';
import { Save, QrCode } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useSettings } from '../../context/SettingsContext';

const QRSettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.qr);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    setFormData(settings.qr);
  }, [settings.qr]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateCategorySettings('qr', formData);
    setSaving(false);
    alert('QR settings saved successfully!');
  };

  return (
    <Card className="m-6">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#DDE6F0] dark:border-[#263B50] pb-4">
        <div>
          <CardTitle className="flex items-center text-[#162033] dark:text-white">
            <QrCode className="w-5 h-5 mr-2 text-[#2482ED]" /> Dynamic QR Code Setup
          </CardTitle>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">Configure UPI payments, review links, and invoice QR generation.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#132B42] p-5 border border-[#DDE6F0] dark:border-[#263B50] rounded-xl">
            <h3 className="text-sm font-bold text-[#162033] dark:text-white mb-4">Invoice QR Settings</h3>
            
            <label className="flex items-center mb-4">
              <input type="checkbox" name="enableInvoiceQr" checked={formData.enableInvoiceQr} onChange={handleChange} className="form-checkbox h-4 w-4 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]" />
              <span className="ml-3 text-sm text-[#162033] dark:text-white">Enable Digital Invoice QR</span>
            </label>

            <label className="flex items-center mb-4">
              <input type="checkbox" name="enableUpiQr" checked={formData.enableUpiQr} onChange={handleChange} className="form-checkbox h-4 w-4 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]" />
              <span className="ml-3 text-sm text-[#162033] dark:text-white">Embed UPI Payment QR on Invoice</span>
            </label>

            {formData.enableUpiQr && (
              <div className="ml-7 mb-4">
                <Input label="Merchant UPI ID" name="upiId" value={formData.upiId} onChange={handleChange} placeholder="e.g. yourbusiness@bank" />
              </div>
            )}

            <label className="flex items-center mb-4">
              <input type="checkbox" name="enableReviewQr" checked={formData.enableReviewQr} onChange={handleChange} className="form-checkbox h-4 w-4 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]" />
              <span className="ml-3 text-sm text-[#162033] dark:text-white">Include Google Review Link QR</span>
            </label>

            {formData.enableReviewQr && (
              <div className="ml-7">
                <Input label="Review Link URL" name="reviewUrl" value={formData.reviewUrl} onChange={handleChange} placeholder="https://g.page/r/..." />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#132B42] p-5 border border-[#DDE6F0] dark:border-[#263B50] rounded-xl">
            <h3 className="text-sm font-bold text-[#162033] dark:text-white mb-4">Customer Display QR</h3>
            
            <p className="text-sm text-[#64748B] dark:text-slate-400 mb-4">
              If you have a customer-facing display screen, you can show a dynamic QR code for payment.
            </p>
            
            <label className="flex items-center mb-4">
              <input type="checkbox" name="enableWebsiteQr" checked={formData.enableWebsiteQr} onChange={handleChange} className="form-checkbox h-4 w-4 text-[#2482ED] rounded focus:ring-[#2482ED] border-[#DDE6F0] dark:border-[#263B50] dark:bg-[#0B1A2A]" />
              <span className="ml-3 text-sm text-[#162033] dark:text-white">Show Pharmacy Website/App QR when idle</span>
            </label>
            
            {formData.enableWebsiteQr && (
              <div className="ml-7 mb-4">
                <Input label="Website / App Store URL" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-[#64748B] dark:text-slate-300 mb-1">QR Display Size</label>
              <select 
                name="displaySize" 
                value={formData.displaySize} 
                onChange={handleChange}
                className="block w-full rounded-md border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#0B1A2A] px-3 py-2 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-1 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100"
              >
                <option value="Small">Small (150x150)</option>
                <option value="Medium">Medium (300x300)</option>
                <option value="Large">Large (500x500)</option>
              </select>
            </div>
          </div>
        </div>

      </div>
      </CardContent>
    </Card>
  );
};

export default QRSettings;
