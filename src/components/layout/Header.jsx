import { useState, useRef, useEffect } from 'react';
import { User, Sun, Moon, LogOut, Settings, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';
import { resolvePageTitle } from '../../utils/pageTitles';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isCollapsed, toggle, openMobile } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const { title: pageTitle, Icon } = resolvePageTitle(location.pathname);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-[#102A43] border-b border-[#D9E6F2] dark:border-[#23415C] h-16 flex items-center gap-3 px-4 sticky top-0 z-10">

      {/* ── Mobile hamburger (< lg only) ──────────────────────── */}
      <button
        onClick={openMobile}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[#627D98] dark:text-[#B8CCE0] hover:bg-[#EAF4FF] dark:hover:bg-[#163A59] transition-colors flex-shrink-0 cursor-pointer"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ── Desktop sidebar panel toggle (lg+) ───────────────── */}
      <button
        onClick={toggle}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg text-[#1677FF] dark:text-[#7DD3FC] hover:bg-[#EAF4FF] dark:hover:bg-[#163A59] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1677FF] focus-visible:ring-offset-1 transition-colors duration-150 flex-shrink-0 cursor-pointer"
      >
        {isCollapsed
          ? <PanelLeftOpen  className="h-[18px] w-[18px]" />
          : <PanelLeftClose className="h-[18px] w-[18px]" />
        }
      </button>

      {/* ── Current page title & icon ───────────────────────────────── */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        {Icon && <Icon className="w-[18px] h-[18px] text-[#1677FF] dark:text-[#38BDF8] flex-shrink-0" />}
        <h1 className="text-[16px] sm:text-[17px] font-semibold text-[#102A43] dark:text-[#F8FAFC] truncate leading-none">
          {pageTitle}
        </h1>
      </div>

      {/* ── Right-side controls ───────────────────────────────── */}
      <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="relative inline-flex items-center justify-center w-14 h-7 rounded-full bg-[#EAF4FF] dark:bg-[#163A59] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1677FF] focus:ring-offset-2 dark:focus:ring-offset-[#102A43] cursor-pointer"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="sr-only">Toggle theme</span>
          <span
            className={`absolute left-1 flex items-center justify-center w-5 h-5 rounded-full bg-white dark:bg-[#102A43] shadow transform transition-transform duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}
          >
            {theme === 'dark'
              ? <Moon className="w-3 h-3 text-[#38BDF8]" />
              : <Sun  className="w-3 h-3 text-yellow-500" />
            }
          </span>
        </button>

        <NotificationDropdown />

        {/* Profile menu */}
        <div
          className="flex items-center gap-3 border-l border-[#D9E6F2] dark:border-[#23415C] pl-4 relative"
          ref={profileMenuRef}
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-[#102A43] dark:text-[#F8FAFC] leading-none">{currentUser?.name}</p>
            <p className="text-xs text-[#627D98] dark:text-[#B8CCE0] mt-1 font-semibold">{currentUser?.role}</p>
            <p className="text-[10px] text-[#829AB1] dark:text-[#8FA9BF] mt-0.5">{currentUser?.email}</p>
          </div>

          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="h-9 w-9 rounded-full bg-[#EAF4FF] dark:bg-[#163A59] flex items-center justify-center text-[#1677FF] dark:text-[#38BDF8] focus:outline-none focus:ring-2 focus:ring-[#1677FF] border border-[#D9E6F2] dark:border-[#23415C] transition-colors"
          >
            <User className="h-5 w-5" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-12 mt-2 w-48 bg-white dark:bg-[#102A43] rounded-md shadow-lg py-1 border border-[#D9E6F2] dark:border-[#23415C] z-50">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 sm:hidden">
                <p className="text-sm font-medium text-[#102A43] dark:text-white">{currentUser?.name}</p>
                <p className="text-xs text-[#627D98] dark:text-[#B8CCE0] font-semibold">{currentUser?.role}</p>
                <p className="text-[10px] text-[#829AB1] dark:text-[#8FA9BF]">{currentUser?.email}</p>
              </div>

              <button
                onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                className="w-full text-left px-4 py-2 text-sm text-[#102A43] dark:text-[#D9E6F2] hover:bg-[#EAF4FF] dark:hover:bg-[#163A59] flex items-center transition-colors"
              >
                <User className="w-4 h-4 mr-2" /> My Profile
              </button>

              <button
                onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                className="w-full text-left px-4 py-2 text-sm text-[#102A43] dark:text-[#D9E6F2] hover:bg-[#EAF4FF] dark:hover:bg-[#163A59] flex items-center transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" /> Settings
              </button>

              <div className="border-t border-gray-100 dark:border-slate-700 my-1" />

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
