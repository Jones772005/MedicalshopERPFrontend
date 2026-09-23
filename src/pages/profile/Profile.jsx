import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, Lock, Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Profile = () => {
  const { currentUser } = useAuth();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [saving, setSaving] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert("Password updated successfully.");
    }, 1000);
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader title="My Profile" description="Manage your personal information and security settings." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mx-auto flex items-center justify-center text-3xl font-bold mb-4">
              {currentUser.firstName ? currentUser.firstName[0] : currentUser.name[0]}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">{currentUser.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400">
              {currentUser.role}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2 mb-4 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-primary-500" /> Account Security
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Last Login</span>
                <span className="text-gray-900 dark:text-white">Today, 09:05 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Two-Factor Auth</span>
                <span className="text-red-500 font-medium">Disabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Password */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-primary-500" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Full Name</label>
                <div className="mt-1 text-sm text-gray-900 dark:text-white font-medium">{currentUser.name}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Employee ID</label>
                <div className="mt-1 text-sm text-gray-900 dark:text-white font-medium">{currentUser.employeeId || 'EMP-XXXX'}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Email Address</label>
                <div className="mt-1 text-sm text-gray-900 dark:text-white font-medium">{currentUser.email}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Phone Number</label>
                <div className="mt-1 text-sm text-gray-900 dark:text-white font-medium">{currentUser.phone || '+91 -'}</div>
              </div>
            </div>
            <div className="mt-6 text-sm text-gray-500 dark:text-slate-400">
              * To update your personal information, please contact the System Administrator.
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2 mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-primary-500" /> Change Password
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <Input 
                label="Current Password" 
                type="password" 
                name="currentPassword" 
                value={passwordData.currentPassword} 
                onChange={handlePasswordChange} 
                required 
              />
              <Input 
                label="New Password" 
                type="password" 
                name="newPassword" 
                value={passwordData.newPassword} 
                onChange={handlePasswordChange} 
                required 
              />
              <Input 
                label="Confirm New Password" 
                type="password" 
                name="confirmPassword" 
                value={passwordData.confirmPassword} 
                onChange={handlePasswordChange} 
                required 
              />
              
              <div className="pt-2">
                <Button type="submit" disabled={saving}>
                  <Save className="w-4 h-4 mr-2" /> {saving ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
