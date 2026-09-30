import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Building2, FileText, Calculator, Bell, Printer, 
  Barcode, QrCode, Shield, Database, Activity, ArrowLeft 
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navigationGroups = [
  {
    group: 'GENERAL',
    items: [
      { name: 'Pharmacy Info', to: '/settings/pharmacy', icon: Building2 },
      { name: 'Invoice', to: '/settings/invoice', icon: FileText },
      { name: 'Tax & GST', to: '/settings/tax', icon: Calculator },
    ]
  },
  {
    group: 'OPERATIONS',
    items: [
      { name: 'Notifications', to: '/settings/notifications', icon: Bell },
      { name: 'Printer', to: '/settings/printer', icon: Printer },
      { name: 'Barcode', to: '/settings/barcode', icon: Barcode },
      { name: 'QR Code', to: '/settings/qr', icon: QrCode },
    ]
  },
  {
    group: 'SYSTEM',
    items: [
      { name: 'Security', to: '/settings/security', icon: Shield },
      { name: 'Backup & Restore', to: '/settings/backup', icon: Database },
      { name: 'System Admin', to: '/settings/system', icon: Activity },
    ]
  }
];

const SettingsLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full space-y-4 pb-12">
      {/* ── SETTINGS PAGE HEADER ──────────────────────────── */}
      <div className="flex items-center space-x-3.5 pt-1 w-full">
        <button 
          type="button"
          onClick={() => navigate('/dashboard')} 
          aria-label="Back to dashboard"
          className="p-2 bg-white dark:bg-[#102A43] rounded-lg shadow-xs border border-[#DDE6F0] dark:border-slate-700/60 hover:bg-[#F5F8FC] dark:hover:bg-slate-800 text-[#64748B] dark:text-slate-300 hover:text-[#162033] dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#2482ED]"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#162033] dark:text-white">
            Settings
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Manage your pharmacy, billing, tax and system configuration.
          </p>
        </div>
      </div>

      {/* ── MAIN SETTINGS CONTAINER ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-5 items-start w-full">
        {/* Settings Navigation Sidebar — Compact 200px width on desktop */}
        <aside className="w-full min-w-0">
          <nav 
            aria-label="Settings categories"
            className="bg-white dark:bg-[#102A43] p-2 rounded-xl shadow-xs border border-[#DDE6F0] dark:border-slate-700/60 flex flex-row lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible hide-scrollbar"
          >
            {navigationGroups.map((group) => (
              <div key={group.group} className="space-y-0.5 min-w-[180px] lg:min-w-0 flex-shrink-0 lg:flex-shrink">
                <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-bold tracking-wider uppercase text-[#94A3B8] dark:text-slate-400 select-none">
                  {group.group}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center h-9 px-2.5 text-[13px] font-medium rounded-lg whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-[#2482ED]",
                          isActive
                            ? "bg-[#2482ED]/10 text-[#2482ED] dark:bg-[#2482ED]/25 dark:text-blue-300 font-semibold shadow-xs"
                            : "text-[#64748B] hover:bg-[#F5F8FC] hover:text-[#162033] dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                        )
                      }
                    >
                      <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Settings Content Area — Expanded full available width */}
        <section aria-label="Settings content" className="w-full min-w-0">
          <div className="w-full bg-white dark:bg-[#102A43] rounded-xl shadow-xs border border-[#DDE6F0] dark:border-slate-700/60 min-h-[580px] p-5 sm:p-6 overflow-hidden">
            <Outlet />
          </div>
        </section>
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
