import { useState } from 'react';
import { QrCode } from 'lucide-react';
import Input from '../../components/common/Input';
import { useSettings } from '../../context/SettingsContext';
import SettingsHeader from '../../components/settings/SettingsHeader';
import SettingsSection from '../../components/settings/SettingsSection';

const QRSettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.qr || {});
  const [prevSettings, setPrevSettings] = useState(settings.qr);
  const [saving, setSaving] = useState(false);

  if (prevSettings !== settings.qr) {
    setPrevSettings(settings.qr);
    setFormData(settings.qr || {});
  }

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(settings.qr);

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
    <div>
      <SettingsHeader
        icon={QrCode}
        title="Dynamic QR Code Setup"
        description="Configure UPI payments, digital invoice access, customer reviews, and pole display QR codes."
        onSave={handleSave}
        saving={saving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Left: Invoice QR Codes */}
        <div className="space-y-6">
          <SettingsSection title="Invoice & Payment QR Codes">
            <div className="bg-[#F8FAFC] dark:bg-slate-800/40 p-4 rounded-xl border border-[#DDE6F0] dark:border-slate-700/60 space-y-4">
              <label className="flex items-start p-2.5 rounded-lg border border-[#DDE6F0] dark:border-slate-700/60 bg-white dark:bg-[#102A43] cursor-pointer">
                <input 
                  type="checkbox" 
                  name="enableInvoiceQr" 
                  checked={formData.enableInvoiceQr || false} 
                  onChange={handleChange} 
                  className="h-4 w-4 mt-0.5 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                />
                <div className="ml-3">
                  <span className="block text-xs font-bold text-[#162033] dark:text-white">
                    Enable Digital Invoice QR
                  </span>
                  <span className="block text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                    Customers can scan invoice to view or download a paperless PDF copy
                  </span>
                </div>
              </label>

              <div className="p-3 rounded-lg border border-[#DDE6F0] dark:border-slate-700/60 bg-white dark:bg-[#102A43] space-y-3">
                <label className="flex items-start cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="enableUpiQr" 
                    checked={formData.enableUpiQr || false} 
                    onChange={handleChange} 
                    className="h-4 w-4 mt-0.5 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                  />
                  <div className="ml-3">
                    <span className="block text-xs font-bold text-[#162033] dark:text-white">
                      Embed UPI Payment QR on Invoices
                    </span>
                    <span className="block text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                      Encodes merchant VPA and exact payable amount dynamically
                    </span>
                  </div>
                </label>

                {formData.enableUpiQr && (
                  <div className="pt-2 pl-7">
                    <Input 
                      label="Merchant UPI ID (VPA)" 
                      name="upiId" 
                      value={formData.upiId || ''} 
                      onChange={handleChange} 
                      placeholder="e.g. pharmacy@okhdfcbank" 
                      required 
                    />
                  </div>
                )}
              </div>

              <div className="p-3 rounded-lg border border-[#DDE6F0] dark:border-slate-700/60 bg-white dark:bg-[#102A43] space-y-3">
                <label className="flex items-start cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="enableReviewQr" 
                    checked={formData.enableReviewQr || false} 
                    onChange={handleChange} 
                    className="h-4 w-4 mt-0.5 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                  />
                  <div className="ml-3">
                    <span className="block text-xs font-bold text-[#162033] dark:text-white">
                      Include Google Review Link QR
                    </span>
                    <span className="block text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                      Invites customers to leave feedback for your pharmacy
                    </span>
                  </div>
                </label>

                {formData.enableReviewQr && (
                  <div className="pt-2 pl-7">
                    <Input 
                      label="Google Business / Review URL" 
                      name="reviewUrl" 
                      value={formData.reviewUrl || ''} 
                      onChange={handleChange} 
                      placeholder="https://g.page/r/..." 
                    />
                  </div>
                )}
              </div>
            </div>
          </SettingsSection>
        </div>

        {/* Right: Customer Display QR */}
        <div className="space-y-6">
          <SettingsSection title="Customer Display & Kiosk QR">
            <div className="bg-[#F8FAFC] dark:bg-slate-800/40 p-4 rounded-xl border border-[#DDE6F0] dark:border-slate-700/60 space-y-4">
              <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                If your counter includes a customer-facing screen, you can show a prominent dynamic QR code for instant UPI payment or idle website branding.
              </p>

              <div className="p-3 rounded-lg border border-[#DDE6F0] dark:border-slate-700/60 bg-white dark:bg-[#102A43] space-y-3">
                <label className="flex items-start cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="enableWebsiteQr" 
                    checked={formData.enableWebsiteQr || false} 
                    onChange={handleChange} 
                    className="h-4 w-4 mt-0.5 text-[#2482ED] rounded border-[#DDE6F0] dark:border-slate-600 focus:ring-[#2482ED] cursor-pointer" 
                  />
                  <div className="ml-3">
                    <span className="block text-xs font-bold text-[#162033] dark:text-white">
                      Show Pharmacy Website / App QR when idle
                    </span>
                    <span className="block text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                      Promotes repeat online orders when cashier is not currently billing
                    </span>
                  </div>
                </label>

                {formData.enableWebsiteQr && (
                  <div className="pt-2 pl-7">
                    <Input 
                      label="Website / App Store URL" 
                      name="websiteUrl" 
                      value={formData.websiteUrl || ''} 
                      onChange={handleChange} 
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="displaySize" className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-300 mb-1.5">
                  Display Screen QR Size
                </label>
                <select 
                  id="displaySize"
                  name="displaySize" 
                  value={formData.displaySize || 'Medium'} 
                  onChange={handleChange} 
                  className="block w-full rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm focus:border-[#2482ED] focus:outline-none focus:ring-2 focus:ring-[#2482ED] text-[#162033] dark:text-slate-100 transition-colors"
                >
                  <option value="Small">Small (150 × 150 px)</option>
                  <option value="Medium">Medium (300 × 300 px - Recommended)</option>
                  <option value="Large">Large (500 × 500 px)</option>
                </select>
              </div>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
};

export default QRSettings;
