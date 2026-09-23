import { useState, useEffect } from 'react';
import { Save, Building2, Upload } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

const PharmacySettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.pharmacy);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    setFormData(settings.pharmacy);
  }, [settings.pharmacy]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // eslint-disable-next-line react/set-state-in-effect
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateCategorySettings('pharmacy', formData);
    setSaving(false);
    alert('Pharmacy settings saved successfully!');
  };

  return (
    <Card className="m-6">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#DDE6F0] dark:border-[#263B50] pb-4">
        <div>
          <CardTitle className="flex items-center text-[#162033] dark:text-white">
            <Building2 className="w-5 h-5 mr-2 text-[#2482ED]" /> Pharmacy Information
          </CardTitle>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">Configure your business details shown on invoices.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Pharmacy Name" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Owner Name" name="owner" value={formData.owner} onChange={handleChange} required />
            <Input label="Registration Number" name="registrationNo" value={formData.registrationNo} onChange={handleChange} required />
            <Input label="Drug License Number" name="drugLicenseNo" value={formData.drugLicenseNo} onChange={handleChange} required />
            <Input label="GSTIN" name="gstin" value={formData.gstin} onChange={handleChange} required />
          </div>

          <div className="border-t border-[#DDE6F0] dark:border-[#263B50] pt-6 mt-6">
            <h3 className="text-sm font-bold text-[#162033] dark:text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required />
              <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
              <Input label="Website URL" name="website" value={formData.website} onChange={handleChange} />
            </div>
          </div>

          <div className="border-t border-[#DDE6F0] dark:border-[#263B50] pt-6 mt-6">
            <h3 className="text-sm font-bold text-[#162033] dark:text-white mb-4">Location Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input label="Street Address" name="address" value={formData.address} onChange={handleChange} required />
              </div>
              <Input label="City" name="city" value={formData.city} onChange={handleChange} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="State" name="state" value={formData.state} onChange={handleChange} required />
                <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} required />
              </div>
            </div>
          </div>
        </div>

        {/* Logo Upload Section */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-[#64748B] dark:text-slate-300">Pharmacy Logo</label>
          <div className="border-2 border-dashed border-[#DDE6F0] dark:border-[#263B50] rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-[#F5F8FC] dark:hover:bg-[#0B1A2A] transition-colors">
            <div className="w-32 h-32 bg-[#F5F8FC] dark:bg-[#0B1A2A] border border-[#DDE6F0] dark:border-[#263B50] rounded-lg mb-4 flex items-center justify-center text-[#64748B] dark:text-slate-500">
              <Building2 className="w-12 h-12" />
            </div>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mb-4">Recommended size: 256x256px (PNG, JPG)</p>
            <Button variant="outline" className="w-full justify-center">
              <Upload className="w-4 h-4 mr-2" /> Upload Logo
            </Button>
          </div>
        </div>
      </div>
      </CardContent>
    </Card>
  );
};

export default PharmacySettings;
