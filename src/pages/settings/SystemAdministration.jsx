import { useState } from 'react';
import { Activity, Power, HardDrive, Cpu, AlertTriangle, Users } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { usersData as demoUsers } from '../../data/users';
import localDb from '../../services/localDb';

const SystemAdministration = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { currentUser, switchDemoUser } = useAuth();

  const handleDemoSwitch = (email) => {
    try {
      switchDemoUser(email);
      // eslint-disable-next-line react/immutability
      window.location.href = '/dashboard'; // Force full app reload to re-mount routing & sidebar
    } catch (err) {
      alert("Failed to switch demo user.");
    }
  };

  return (
    <div className="p-6 pb-12">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-primary-500" /> System Administration
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Advanced controls for ERP server and maintenance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 border border-gray-200 dark:border-slate-700 rounded-lg">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center">
              <Cpu className="w-4 h-4 mr-2" /> Server Metrics
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-slate-900 rounded p-4 border border-gray-100 dark:border-slate-700">
                <span className="block text-xs text-gray-500 dark:text-slate-400">CPU Usage</span>
                <span className="block text-2xl font-bold text-gray-900 dark:text-white mt-1">12%</span>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 dark:bg-gray-700">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-900 rounded p-4 border border-gray-100 dark:border-slate-700">
                <span className="block text-xs text-gray-500 dark:text-slate-400">Memory (RAM)</span>
                <span className="block text-2xl font-bold text-gray-900 dark:text-white mt-1">2.4 GB</span>
                <span className="block text-xs text-gray-500 mt-1">of 8.0 GB (30%)</span>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 dark:bg-gray-700">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-900 rounded p-4 border border-gray-100 dark:border-slate-700">
                <span className="block text-xs text-gray-500 dark:text-slate-400 flex items-center"><HardDrive className="w-3 h-3 mr-1" /> Storage</span>
                <span className="block text-2xl font-bold text-gray-900 dark:text-white mt-1">45 GB</span>
                <span className="block text-xs text-gray-500 mt-1">of 500 GB (9%)</span>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 dark:bg-gray-700">
                  <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: '9%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 border border-red-200 dark:border-red-900/30 rounded-lg">
            <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-4 border-b border-red-100 dark:border-red-900/20 pb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" /> Danger Zone
            </h3>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                <div className="mb-3 sm:mb-0">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Clear Cache & Temporary Files</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Frees up storage by removing temp generated PDFs and barcodes.</p>
                </div>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-100 dark:hover:bg-red-900/30" onClick={() => alert("Cache cleared!")}>
                  Clear Cache
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                <div className="mb-3 sm:mb-0">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Factory Reset System</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Permanently deletes all data including sales, inventory, and staff.</p>
                </div>
                <Button className="bg-red-600 hover:bg-red-700 text-white border-transparent" onClick={() => window.confirm("Are you ABSOLUTELY sure? This cannot be undone.")}>
                  Factory Reset
                </Button>
              </div>

              {currentUser?.role === 'Administrator' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/30">
                  <div className="mb-3 sm:mb-0">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" /> Reset Demo Data
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-md">
                      Permanently removes all medicines, inventory, purchases, sales, customers, suppliers, payments, returns, notifications, discounts, and other business data. Demo accounts and settings are preserved.
                    </p>
                  </div>
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white border-transparent whitespace-nowrap" 
                    onClick={() => {
                      if (window.confirm("Reset demo data?\n\nThis will permanently remove all medicines, inventory, purchases, sales, customers, suppliers, payments, returns, notifications, discounts, and other business data from this browser. Demo login accounts and system settings will be preserved.")) {
                        localDb.resetDemoData();
                        window.location.href = '/dashboard';
                      }
                    }}
                  >
                    Reset Demo Data
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 border border-gray-200 dark:border-slate-700 rounded-lg">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Maintenance Mode</h3>
            
            <div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} />
                  <div className={`block w-14 h-8 rounded-full ${maintenanceMode ? 'bg-red-500' : 'bg-gray-300 dark:bg-slate-600'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${maintenanceMode ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-gray-700 dark:text-gray-300 font-medium">
                  {maintenanceMode ? 'Active' : 'Disabled'}
                </div>
              </label>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-slate-400">
              When enabled, only Administrators can log in. All other active sessions will be terminated and cashiers will see a maintenance screen.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 border border-gray-200 dark:border-slate-700 rounded-lg">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Power className="w-4 h-4 mr-2" /> Server Power
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
              Restarting the server application may cause a temporary 30-second outage for all users.
            </p>
            <Button variant="outline" className="w-full justify-center" onClick={() => alert("Restarting server...")}>
              Restart Services
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 border border-indigo-200 dark:border-indigo-900/30 rounded-lg shadow-sm">
            <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mb-4 border-b border-indigo-100 dark:border-indigo-900/20 pb-2 flex items-center">
              <Users className="w-4 h-4 mr-2" /> Demo Testing Only
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
              Instantly switch the active session to another role. This simulates a fresh login.
            </p>
            
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {demoUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleDemoSwitch(user.email)}
                  disabled={currentUser?.email === user.email}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-colors flex flex-col ${
                    currentUser?.email === user.email
                      ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 cursor-default'
                      : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={`font-semibold ${currentUser?.email === user.email ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                    {user.role} {currentUser?.email === user.email && '(Current)'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{user.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SystemAdministration;
