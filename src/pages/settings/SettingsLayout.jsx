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
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
        
        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          {settingsNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-750"
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
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 min-h-[600px]">
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
