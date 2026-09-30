import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import SettingsHeader from '../../components/settings/SettingsHeader';
import SettingsSection from '../../components/settings/SettingsSection';

const NotificationSettings = () => {
  const { settings, updateCategorySettings } = useSettings();
  const [formData, setFormData] = useState(settings.notifications || {});
  const [prevSettings, setPrevSettings] = useState(settings.notifications);
  const [saving, setSaving] = useState(false);

  if (prevSettings !== settings.notifications) {
    setPrevSettings(settings.notifications);
    setFormData(settings.notifications || {});
  }

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(settings.notifications);

  const handleChange = (e) => {
    const { name, checked } = e.target;
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
      description: "Triggered by stock thresholds & expiry",
      items: [
        { id: "lowStock", label: "Low Stock Warnings" },
        { id: "outOfStock", label: "Out of Stock Alerts" },
        { id: "nearExpiry", label: "Near Expiry Warnings" },
        { id: "expiredMedicines", label: "Expired Medicines Alerts" }
      ]
    },
    {
      title: "Business & Financial",
      description: "Purchases, dues, and verification",
      items: [
        { id: "purchaseDue", label: "Pending Purchase Deliveries" },
        { id: "supplierPaymentDue", label: "Supplier Payments Due" },
        { id: "largeDiscountAlert", label: "High Discount Authorizations" },
        { id: "pendingVerification", label: "Prescriptions Pending Verification" }
      ]
    },
    {
      title: "Delivery Channels",
      description: "System dispatch endpoints",
      items: [
        { id: "inAppNotifications", label: "In-App Bell Notifications" },
        { id: "emailNotifications", label: "Daily Email Digest" },
        { id: "smsNotifications", label: "SMS Critical Emergency Alerts" }
      ]
    }
  ];

  return (
    <div>
      <SettingsHeader
        icon={Bell}
        title="Notifications & Alerts"
        description="Configure events and channels that trigger system alerts for pharmacy staff."
        onSave={handleSave}
        saving={saving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alertGroups.map((group, idx) => (
          <SettingsSection key={idx} title={group.title} description={group.description}>
            <div className="bg-[#F8FAFC] dark:bg-slate-800/40 border border-[#DDE6F0] dark:border-slate-700/60 rounded-xl p-4 space-y-3">
              {group.items.map(item => {
                const isChecked = formData[item.id] || false;

                return (
                  <label 
                    key={item.id} 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-[13px] font-medium text-[#162033] dark:text-slate-200 pr-2">
                      {item.label}
                    </span>
                    
                    {/* Accessible Toggle */}
                    <div className="relative inline-flex items-center">
                      <input 
                        type="checkbox" 
                        name={item.id}
                        checked={isChecked}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#DDE6F0] dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#2482ED] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2482ED]"></div>
                    </div>
                  </label>
                );
              })}
            </div>
          </SettingsSection>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings;
