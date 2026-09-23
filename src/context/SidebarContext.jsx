import { createContext, useContext, useState, useCallback } from 'react';

const SidebarContext = createContext(null);

const STORAGE_KEY = 'medishop-sidebar-collapsed';

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Programmatically expand — used by NavGroup when user clicks a collapsed group icon
  const expand = useCallback(() => {
    setIsCollapsed(prev => {
      if (prev) {
        try { localStorage.setItem(STORAGE_KEY, 'false'); } catch { /* ignore */ }
        return false;
      }
      return prev;
    });
  }, []);

  const openMobile  = useCallback(() => setIsMobileOpen(true),  []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle, expand, isMobileOpen, openMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
};
