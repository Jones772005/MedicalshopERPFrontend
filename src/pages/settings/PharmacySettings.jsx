import { useState, useRef } from 'react';
import { Building2, Phone, MapPin, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useSettings } from '../../context/SettingsContext';
import SettingsHeader from '../../components/settings/SettingsHeader';
import SettingsSection from '../../components/settings/SettingsSection';

const PharmacySettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.pharmacy || {});
  const [prevSettings, setPrevSettings] = useState(settings.pharmacy);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Synchronize state during render if context updates without causing cascading useEffect renders
  if (prevSettings !== settings.pharmacy) {
    setPrevSettings(settings.pharmacy);
    setFormData(settings.pharmacy || {});
  }

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(settings.pharmacy);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please upload an image file (PNG, JPG, etc.)' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target.result;
      setFormData(prev => ({ ...prev, logo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const errs = {};
    if (!formData.name?.trim()) errs.name = 'Pharmacy name is required';
    if (!formData.owner?.trim()) errs.owner = 'Owner name is required';
    if (!formData.registrationNo?.trim()) errs.registrationNo = 'Registration number is required';
    if (!formData.drugLicenseNo?.trim()) errs.drugLicenseNo = 'Drug license number is required';
    if (!formData.gstin?.trim()) errs.gstin = 'GSTIN is required';
    if (!formData.phone?.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]{7,20}$/.test(formData.phone.trim())) {
      errs.phone = 'Valid phone number required';
    }
    if (!formData.email?.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Valid email address required';
    }
    if (!formData.address?.trim()) errs.address = 'Street address is required';
    if (!formData.city?.trim()) errs.city = 'City is required';
    if (!formData.state?.trim()) errs.state = 'State is required';
    if (!formData.pincode?.trim()) errs.pincode = 'Pincode is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    setStatusMessage(null);
    if (!validate()) return;
    setSaving(true);
    await updateCategorySettings('pharmacy', formData);
    setSaving(false);
    setStatusMessage({ type: 'success', text: 'Pharmacy settings saved successfully!' });
  };

  return (
    <div>
      <SettingsHeader
        icon={Building2}
        title="Pharmacy Information"
        description="Configure your business details shown on invoices."
        onSave={handleSave}
        saving={saving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {statusMessage && (
        <div className={`mb-6 p-4 rounded-lg border text-sm ${
          statusMessage.type === 'error'
            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
            : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
        }`}>
          {statusMessage.text}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-7 items-start">
        {/* Left: Main Form Fields — Expanded with comfortable breathing room */}
        <div className="flex-1 w-full min-w-0 space-y-6">
          <SettingsSection icon={Building2} title="Pharmacy Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Pharmacy Name" 
                name="name" 
                value={formData.name || ''} 
                onChange={handleChange} 
                required 
                error={errors.name}
              />
              <Input 
                label="Owner Name" 
                name="owner" 
                value={formData.owner || ''} 
                onChange={handleChange} 
                required 
                error={errors.owner}
              />
              <Input 
                label="Registration Number" 
                name="registrationNo" 
                value={formData.registrationNo || ''} 
                onChange={handleChange} 
                required 
                error={errors.registrationNo}
              />
              <Input 
                label="Drug License Number" 
                name="drugLicenseNo" 
                value={formData.drugLicenseNo || ''} 
                onChange={handleChange} 
                required 
                error={errors.drugLicenseNo}
              />
              <div className="sm:col-span-2">
                <Input 
                  label="GSTIN" 
                  name="gstin" 
                  value={formData.gstin || ''} 
                  onChange={handleChange} 
                  required 
                  error={errors.gstin}
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection icon={Phone} title="Contact Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Phone Number" 
                name="phone" 
                value={formData.phone || ''} 
                onChange={handleChange} 
                required 
                error={errors.phone}
              />
              <Input 
                label="Email Address" 
                type="email" 
                name="email" 
                value={formData.email || ''} 
                onChange={handleChange} 
                required 
                error={errors.email}
              />
              <div className="sm:col-span-2">
                <Input 
                  label="Website URL" 
                  name="website" 
                  value={formData.website || ''} 
                  onChange={handleChange} 
                  placeholder="https://..." 
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection icon={MapPin} title="Location Details">
            <div className="space-y-4">
              <Input 
                label="Street Address" 
                name="address" 
                value={formData.address || ''} 
                onChange={handleChange} 
                required 
                error={errors.address}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input 
                  label="City" 
                  name="city" 
                  value={formData.city || ''} 
                  onChange={handleChange} 
                  required 
                  error={errors.city}
                />
                <Input 
                  label="State" 
                  name="state" 
                  value={formData.state || ''} 
                  onChange={handleChange} 
                  required 
                  error={errors.state}
                />
                <Input 
                  label="Pincode" 
                  name="pincode" 
                  value={formData.pincode || ''} 
                  onChange={handleChange} 
                  required 
                  error={errors.pincode}
                />
              </div>
            </div>
          </SettingsSection>
        </div>

        {/* Right: Pharmacy Logo Panel — Compact, tidy, and space-efficient */}
        <div className="w-full lg:w-[200px] xl:w-[210px] flex-shrink-0">
          <div className="bg-[#F8FAFC] dark:bg-slate-800/40 border border-[#DDE6F0] dark:border-slate-700/60 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center space-x-1.5 pb-1.5 border-b border-[#DDE6F0] dark:border-slate-700/60">
              <ImageIcon className="w-3.5 h-3.5 text-[#2482ED]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#162033] dark:text-slate-100">
                Pharmacy Logo
              </h3>
            </div>

            <div className="flex flex-col items-center text-center pt-0.5">
              <div className="w-20 h-20 bg-white dark:bg-[#102A43] border border-[#DDE6F0] dark:border-slate-700 rounded-lg flex items-center justify-center text-[#64748B] dark:text-slate-400 overflow-hidden shadow-2xs">
                {formData.logo ? (
                  <img 
                    src={formData.logo} 
                    alt="Pharmacy Logo" 
                    className="w-full h-full object-contain p-1" 
                  />
                ) : (
                  <Building2 className="w-7 h-7 opacity-35" />
                )}
              </div>

              <div className="text-[11px] text-[#64748B] dark:text-slate-400 mt-2 space-y-0.5">
                <p className="font-semibold text-[#162033] dark:text-slate-200">256 × 256px</p>
                <p className="text-[10px] text-[#94A3B8] dark:text-slate-400">PNG, JPG</p>
              </div>

              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/png,image/jpeg" 
                onChange={handleLogoUpload} 
                className="hidden" 
              />

              <div className="w-full mt-2.5 space-y-1.5">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full justify-center text-xs h-8 shadow-2xs font-medium"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3 h-3 mr-1.5" />
                  {formData.logo ? 'Change Logo' : 'Upload Logo'}
                </Button>

                {formData.logo && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full justify-center text-[11px] h-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={handleRemoveLogo}
                  >
                    <Trash2 className="w-3 h-3 mr-1 text-red-500" />
                    Remove Logo
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacySettings;
