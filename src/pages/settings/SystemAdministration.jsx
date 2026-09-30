import { useState } from 'react';
import { Activity, Power, HardDrive, Cpu, AlertTriangle, Users, Database } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { usersData as demoUsers } from '../../data/users';
import localDb from '../../services/localDb';
import SettingsHeader from '../../components/settings/SettingsHeader';
import SettingsSection from '../../components/settings/SettingsSection';

const SystemAdministration = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { currentUser, switchDemoUser } = useAuth();

  const handleDemoSwitch = (email) => {
    try {
      switchDemoUser(email);
      // eslint-disable-next-line react/immutability
      window.location.href = '/dashboard'; // Force full app reload to re-mount routing & sidebar
    } catch {
      alert("Failed to switch demo user.");
    }
  };

  return (
    <div>
      <SettingsHeader
        icon={Activity}
        title="System Administration"
        description="Monitor runtime server resources, toggle maintenance mode, switch demo personas, and execute maintenance."
      />

      <div className="space-y-6">
        {/* Top: Server Metrics */}
        <SettingsSection title="Runtime Server Metrics">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#F8FAFC] dark:bg-slate-800/40 rounded-xl p-4 border border-[#DDE6F0] dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 flex items-center">
                  <Cpu className="w-3.5 h-3.5 mr-1 text-[#2482ED]" /> CPU Utilization
                </span>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">Healthy</span>
              </div>
              <span className="block text-2xl font-bold text-[#162033] dark:text-white mt-2">12%</span>
              <div className="w-full bg-[#DDE6F0] dark:bg-slate-700 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div className="bg-[#2482ED] h-1.5 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
            
            <div className="bg-[#F8FAFC] dark:bg-slate-800/40 rounded-xl p-4 border border-[#DDE6F0] dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 flex items-center">
                  <Database className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Memory (RAM)
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">2.4 / 8 GB</span>
              </div>
              <span className="block text-2xl font-bold text-[#162033] dark:text-white mt-2">30%</span>
              <div className="w-full bg-[#DDE6F0] dark:bg-slate-700 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div className="bg-[#24C9A0] h-1.5 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-slate-800/40 rounded-xl p-4 border border-[#DDE6F0] dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 flex items-center">
                  <HardDrive className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Database Disk
                </span>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">45 / 500 GB</span>
              </div>
              <span className="block text-2xl font-bold text-[#162033] dark:text-white mt-2">9%</span>
              <div className="w-full bg-[#DDE6F0] dark:bg-slate-700 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '9%' }}></div>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Middle: Maintenance, Power & Persona Switcher */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <SettingsSection title="System Operations">
              <div className="bg-[#F8FAFC] dark:bg-slate-800/40 p-4 rounded-xl border border-[#DDE6F0] dark:border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[#162033] dark:text-white block">
                      Maintenance Mode
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                      Restricts application access exclusively to system administrators
                    </span>
                  </div>
                  
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      id="maintenanceToggle"
                      checked={maintenanceMode}
                      onChange={() => setMaintenanceMode(!maintenanceMode)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#DDE6F0] dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DDE6F0]/70 dark:border-slate-700/50 flex items-center justify-between">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[#162033] dark:text-white block">
                      Restart Application Services
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                      Flushes cached threads and restarts worker instances
                    </span>
                  </div>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="h-8 px-3 text-xs" 
                    onClick={() => alert("Restarting server services...")}
                  >
                    <Power className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    Restart
                  </Button>
                </div>
              </div>
            </SettingsSection>
          </div>

          <div className="space-y-6">
            <SettingsSection title="Testing & Demo Persona Switcher">
              <div className="bg-[#F8FAFC] dark:bg-slate-800/40 p-4 rounded-xl border border-[#DDE6F0] dark:border-slate-700/60 space-y-2">
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 mb-2">
                  Simulate sign-in as any defined role to test screen permissions and workflow limits.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {demoUsers.map((user) => {
                    const isCurrent = currentUser?.email === user.email;

                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleDemoSwitch(user.email)}
                        disabled={isCurrent}
                        className={`text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                          isCurrent
                            ? 'bg-[#2482ED]/10 border-[#2482ED] text-[#2482ED] dark:text-blue-300 font-bold cursor-default'
                            : 'bg-white dark:bg-[#102A43] border-[#DDE6F0] dark:border-slate-700/70 hover:bg-[#F5F8FC] dark:hover:bg-slate-800 text-[#162033] dark:text-slate-200'
                        }`}
                      >
                        <div className="truncate pr-1">
                          <span className="block font-semibold truncate">{user.role}</span>
                          <span className="text-[10px] text-[#94A3B8] dark:text-slate-400 block truncate">{user.email}</span>
                        </div>
                        {isCurrent ? (
                          <span className="text-[9px] font-bold uppercase bg-[#2482ED] text-white px-1.5 py-0.5 rounded">Active</span>
                        ) : (
                          <Users className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </SettingsSection>
          </div>
        </div>

        {/* Bottom: Danger Zone */}
        <SettingsSection title="Administrative Actions & Danger Zone">
          <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-[#102A43] rounded-lg border border-red-100 dark:border-red-900/30">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#162033] dark:text-white">
                  Purge Cache & Temporary PDFs
                </h4>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                  Frees server memory by clearing cached thermal print previews and barcode renders.
                </p>
              </div>
              <Button 
                type="button"
                variant="outline" 
                className="h-8 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/50 self-start sm:self-center"
                onClick={() => alert("Cache cleared successfully!")}
              >
                Clear Cache
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-[#102A43] rounded-lg border border-red-100 dark:border-red-900/30">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#162033] dark:text-white">
                  Factory Reset System State
                </h4>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                  Resets entire ERP instance to virgin install state. All transactional data will be erased.
                </p>
              </div>
              <Button 
                type="button"
                className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white border-transparent self-start sm:self-center"
                onClick={() => window.confirm("Are you ABSOLUTELY sure? This action cannot be reversed.")}
              >
                Factory Reset
              </Button>
            </div>

            {currentUser?.role === 'Administrator' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-red-100/60 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800/60">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-red-900 dark:text-red-300 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-red-600 dark:text-red-400" />
                    Reset Demo Business Data
                  </h4>
                  <p className="text-[11px] text-red-800/80 dark:text-red-300/80 mt-0.5 max-w-xl">
                    Clears all mocked transactions (sales, purchases, inventory, customers) and retains demo login accounts and system settings.
                  </p>
                </div>
                <Button 
                  type="button"
                  className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white border-transparent whitespace-nowrap self-start sm:self-center" 
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
        </SettingsSection>
      </div>
    </div>
  );
};

export default SystemAdministration;
