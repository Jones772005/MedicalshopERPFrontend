import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import NotificationToastManager from '../components/layout/NotificationToastManager';
import { SidebarProvider } from '../context/SidebarContext';

const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden transition-colors duration-200" style={{ backgroundColor: 'var(--page-bg)' }}>
        <Sidebar />
        {/* Spacer that accounts for sidebar width on desktop — the sidebar is fixed on mobile, relative on lg */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
          <Header />
          <NotificationToastManager />
          <main
            className="flex-1 overflow-y-auto p-4 sm:p-6 transition-colors duration-200"
            style={{ backgroundColor: 'var(--page-bg)' }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
