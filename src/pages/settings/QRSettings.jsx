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
    <div className="p-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <QrCode className="w-5 h-5 mr-2 text-primary-500" /> Dynamic QR Code Setup
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure UPI payments, review links, and invoice QR generation.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 border border-gray-200 dark:border-slate-700 rounded-lg">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Invoice QR Settings</h3>
            
            <label className="flex items-center mb-4">
              <input type="checkbox" name="enableInvoiceQr" checked={formData.enableInvoiceQr} onChange={handleChange} className="form-checkbox h-4 w-4 text-primary-600 rounded" />
              <span className="ml-3 text-sm text-gray-900 dark:text-white">Enable Digital Invoice QR</span>
            </label>

            <label className="flex items-center mb-4">
              <input type="checkbox" name="enableUpiQr" checked={formData.enableUpiQr} onChange={handleChange} className="form-checkbox h-4 w-4 text-primary-600 rounded" />
              <span className="ml-3 text-sm text-gray-900 dark:text-white">Embed UPI Payment QR on Invoice</span>
            </label>

            {formData.enableUpiQr && (
              <div className="ml-7 mb-4">
                <Input label="Merchant UPI ID" name="upiId" value={formData.upiId} onChange={handleChange} placeholder="e.g. yourbusiness@bank" />
              </div>
            )}

            <label className="flex items-center mb-4">
              <input type="checkbox" name="enableReviewQr" checked={formData.enableReviewQr} onChange={handleChange} className="form-checkbox h-4 w-4 text-primary-600 rounded" />
              <span className="ml-3 text-sm text-gray-900 dark:text-white">Include Google Review Link QR</span>
            </label>

            {formData.enableReviewQr && (
              <div className="ml-7">
                <Input label="Review Link URL" name="reviewUrl" value={formData.reviewUrl} onChange={handleChange} placeholder="https://g.page/r/..." />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 border border-gray-200 dark:border-slate-700 rounded-lg">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Customer Display QR</h3>
            
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              If you have a customer-facing display screen, you can show a dynamic QR code for payment.
            </p>
            
            <label className="flex items-center mb-4">
              <input type="checkbox" name="enableWebsiteQr" checked={formData.enableWebsiteQr} onChange={handleChange} className="form-checkbox h-4 w-4 text-primary-600 rounded" />
              <span className="ml-3 text-sm text-gray-900 dark:text-white">Show Pharmacy Website/App QR when idle</span>
            </label>
            
            {formData.enableWebsiteQr && (
              <div className="ml-7 mb-4">
                <Input label="Website / App Store URL" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">QR Display Size</label>
              <select 
                name="displaySize" 
                value={formData.displaySize} 
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
              >
                <option value="Small">Small (150x150)</option>
                <option value="Medium">Medium (300x300)</option>
                <option value="Large">Large (500x500)</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QRSettings;
