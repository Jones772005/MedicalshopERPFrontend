import { useState, useEffect } from 'react';
import { Save, Bell } from 'lucide-react';
import Button from '../../components/common/Button';
import { useSettings } from '../../context/SettingsContext';

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
        { id: "largeDiscountAlert", label: "Large Discount Warnings" },
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
    <div className="p-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Bell className="w-5 h-5 mr-2 text-primary-500" /> Notifications & Alerts
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure which events trigger system alerts.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alertGroups.map((group, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">{group.title}</h3>
            <div className="space-y-3">
              {group.items.map(item => (
                <label key={item.id} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                      type="checkbox" 
                      name={item.id}
                      checked={formData[item.id] || false}
                      onChange={handleChange}
                      className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 dark:border-slate-600 checked:right-0 checked:border-primary-500 dark:checked:border-primary-500 top-0 bottom-0 m-auto transition-all duration-200"
                    />
                    <div className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ${formData[item.id] ? 'bg-primary-500' : 'bg-gray-300 dark:bg-slate-600'}`}></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <style>{`
        .toggle-checkbox:checked { right: 0; border-color: #0ea5e9; }
        .toggle-checkbox:checked + .toggle-label { background-color: #0ea5e9; }
      `}</style>
    </div>
  );
};

export default NotificationSettings;
