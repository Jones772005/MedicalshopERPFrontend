import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Building2, FileText, Calculator, Bell, Printer, 
  Barcode, QrCode, Shield, Database, Activity, ArrowLeft 
} from 'lucide-react';
import { cn } from '../../utils/cn';

const settingsNav = [
  { name: 'Pharmacy Info', to: '/settings/pharmacy', icon: Building2 },
  { name: 'Invoice', to: '/settings/invoice', icon: FileText },
  { name: 'Tax & GST', to: '/settings/tax', icon: Calculator },
  { name: 'Notifications', to: '/settings/notifications', icon: Bell },
  { name: 'Printer', to: '/settings/printer', icon: Printer },
  { name: 'Barcode', to: '/settings/barcode', icon: Barcode },
  { name: 'QR Code', to: '/settings/qr', icon: QrCode },
  { name: 'Security', to: '/settings/security', icon: Shield },
  { name: 'Backup & Restore', to: '/settings/backup', icon: Database },
  { name: 'System Admin', to: '/settings/system', icon: Activity },
];

const SettingsLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto pb-12">
      {/* Settings Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-white dark:bg-[#132B42] rounded-full shadow-sm border border-[#DDE6F0] dark:border-[#263B50] hover:bg-[#F5F8FC] dark:hover:bg-[#0B1A2A] text-[#64748B] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-2xl font-bold text-[#162033] dark:text-white">Settings</h1>
        </div>
        
        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar bg-white dark:bg-[#132B42] p-2 rounded-xl shadow-sm border border-[#DDE6F0] dark:border-[#263B50]">
          {settingsNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-[#2482ED]/10 text-[#2482ED] dark:bg-[#2482ED]/20 dark:text-blue-400"
                    : "text-[#64748B] hover:bg-[#F5F8FC] hover:text-[#162033] dark:text-slate-300 dark:hover:bg-[#0B1A2A] dark:hover:text-white"
                )
              }
            >
              <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1">
        <div className="bg-white dark:bg-[#132B42] rounded-xl shadow-sm border border-[#DDE6F0] dark:border-[#263B50] min-h-[600px] overflow-hidden">
          <Outlet />
        </div>
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default SettingsLayout;
