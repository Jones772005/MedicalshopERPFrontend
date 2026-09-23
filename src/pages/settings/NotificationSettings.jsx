import { useState, useEffect } from 'react';
import { Save, Bell } from 'lucide-react';
import Button from '../../components/common/Button';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

const NotificationSettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.notifications);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    setFormData(settings.notifications);
  }, [settings.notifications]);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    // eslint-disable-next-line react/set-state-in-effect
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateCategorySettings('notifications', formData);
    setSaving(false);
    alert('Notification settings saved successfully!');
  };

  const alertGroups = [
    {
      title: "Inventory Alerts",
      items: [
        { id: "lowStock", label: "Low Stock Warning" },
        { id: "outOfStock", label: "Out of Stock Alerts" },
        { id: "nearExpiry", label: "Near Expiry Warnings" },
        { id: "expiredMedicines", label: "Expired Medicines Alerts" }
      ]
    },
    {
      title: "Business & Financial",
      items: [
        { id: "purchaseDue", label: "Pending Purchase Deliveries" },
        { id: "supplierPaymentDue", label: "Supplier Payments Due" },
        { id: "pendingVerification", label: "Prescriptions Pending Verification" }
      ]
    },
    {
      title: "Delivery Channels",
      items: [
        { id: "inAppNotifications", label: "In-App Notifications (Bell Icon)" },
        { id: "emailNotifications", label: "Email Summaries (Daily)" },
        { id: "smsNotifications", label: "SMS Critical Alerts" }
      ]
    }
  ];

  return (
    <Card className="m-6">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#DDE6F0] dark:border-[#263B50] pb-4">
        <div>
          <CardTitle className="flex items-center text-[#162033] dark:text-white">
            <Bell className="w-5 h-5 mr-2 text-[#2482ED]" /> Notifications & Alerts
          </CardTitle>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">Configure which events trigger system alerts.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alertGroups.map((group, idx) => (
          <div key={idx} className="bg-white dark:bg-[#132B42] border border-[#DDE6F0] dark:border-[#263B50] rounded-xl p-5">
            <h3 className="text-sm font-bold text-[#162033] dark:text-white mb-4 border-b border-[#DDE6F0] dark:border-[#263B50] pb-2">{group.title}</h3>
            <div className="space-y-3">
              {group.items.map(item => (
                <label key={item.id} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-[#162033] dark:text-gray-300">{item.label}</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                      type="checkbox" 
                      name={item.id}
                      checked={formData[item.id] || false}
                      onChange={handleChange}
                      className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-[#DDE6F0] dark:border-[#263B50] checked:right-0 checked:border-[#2482ED] dark:checked:border-[#2482ED] top-0 bottom-0 m-auto transition-all duration-200"
                    />
                    <div className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ${formData[item.id] ? 'bg-[#2482ED]' : 'bg-[#DDE6F0] dark:bg-[#0B1A2A]'}`}></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <style>{`
        .toggle-checkbox:checked { right: 0; border-color: #2482ED; }
        .toggle-checkbox:checked + .toggle-label { background-color: #2482ED; }
      `}</style>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
