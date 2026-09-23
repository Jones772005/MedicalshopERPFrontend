import { NavLink, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Building,
  FileText, Activity, CreditCard, BarChart2, Bell, Shield, Settings,
  ChevronDown, ChevronRight, Pill, Megaphone, X
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { PermissionGuard } from '../../utils/permissions';
import { useSidebar } from '../../context/SidebarContext';

/* ─────────────────────────────────────────────────────────────
   PORTAL TOOLTIP  (position:fixed → escapes overflow-hidden)
   Shown on collapsed nav items on hover.
───────────────────────────────────────────────────────────── */
const PortalTooltip = ({ label, anchorRef, visible }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (visible && anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.top + r.height / 2, left: r.right + 10 });
    }
  }, [visible, anchorRef]);

  if (!visible) return null;
  return createPortal(
    <div
      style={{ top: pos.top, left: pos.left }}
      className="fixed z-[500] -translate-y-1/2 pointer-events-none px-2.5 py-1 text-xs font-medium text-white bg-[#0D1F2D] rounded-md shadow-md whitespace-nowrap select-none"
    >
      {label}
    </div>,
    document.body
  );
};

/* ─────────────────────────────────────────────────────────────
   STANDALONE NAV ITEM  (no children — navigates directly)
───────────────────────────────────────────────────────────── */
const NavItem = ({ to, icon: Icon, label, exact = false }) => {
  const { isCollapsed, closeMobile } = useSidebar();
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);

  return (
    <div className="relative">
      <NavLink
        ref={ref}
        to={to}
        end={exact}
        onClick={closeMobile}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={({ isActive }) =>
          cn(
            'flex items-center transition-colors duration-150 rounded-[7px]',
            isCollapsed
              /* Collapsed: centred icon, 44px tall, horizontal margin 7px each side */
              ? 'justify-center h-11 mx-[7px] my-0.5'
              /* Expanded: left-aligned with text */
              : 'px-3 py-2 gap-3 mx-1.5 my-0.5',
            isActive
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-[#D0E4FC] hover:bg-white/10 hover:text-white'
          )
        }
      >
        {Icon && (
          <Icon
            className={cn(
              'flex-shrink-0 transition-colors duration-150',
              isCollapsed ? 'h-5 w-5' : 'h-[17px] w-[17px]'
            )}
          />
        )}
        {!isCollapsed && (
          <span className="text-[13.5px] font-medium truncate">{label}</span>
        )}
      </NavLink>

      {/* Tooltip — only when collapsed */}
      {isCollapsed && (
        <PortalTooltip label={label} anchorRef={ref} visible={hovered} />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   COLLAPSIBLE NAV GROUP  (has children / submenu)

   COLLAPSED: clicking the icon expands the sidebar and opens
              this group — NO flyout.
   EXPANDED:  standard accordion toggle.
───────────────────────────────────────────────────────────── */
const NavGroup = ({ icon: Icon, label, paths = [], children }) => {
  const { isCollapsed, expand } = useSidebar();
  const location = useLocation();

  const isAnyChildActive = paths.some(p => location.pathname.startsWith(p));
  const [isOpen, setIsOpen] = useState(() => isAnyChildActive);

  // Auto-expand when a child route becomes active
  useEffect(() => {
    if (isAnyChildActive) setIsOpen(true);
  }, [isAnyChildActive]);

  // ── COLLAPSED MODE ─────────────────────────────────────────
  if (isCollapsed) {
    return (
      <div className="flex justify-center">
        <button
          onClick={() => { expand(); setIsOpen(true); }}
          aria-label={`Open ${label}`}
          title={label}
          className={cn(
            'flex items-center justify-center w-full h-11 my-0.5 rounded-[7px] transition-colors duration-150 cursor-pointer',
            'w-[calc(100%-14px)]',
            isAnyChildActive
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-[#D0E4FC] hover:bg-white/10 hover:text-white'
          )}
        >
          <Icon className="h-5 w-5" />
        </button>
      </div>
    );
  }

  // ── EXPANDED MODE ──────────────────────────────────────────
  return (
    <div className="mx-1.5 my-0.5">
      <button
        onClick={() => setIsOpen(o => !o)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-[13.5px] font-medium rounded-[7px] transition-colors duration-150 cursor-pointer',
          isAnyChildActive
            ? 'text-white bg-white/10'
            : 'text-[#D0E4FC] hover:bg-white/10 hover:text-white'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={cn(
              'h-[17px] w-[17px] flex-shrink-0',
              isAnyChildActive ? 'text-white' : 'text-[#A1CAFA]'
            )}
          />
          <span>{label}</span>
        </div>
        {isOpen
          ? <ChevronDown className="h-3.5 w-3.5 opacity-50 flex-shrink-0" />
          : <ChevronRight className="h-3.5 w-3.5 opacity-50 flex-shrink-0" />
        }
      </button>

      {isOpen && (
        <div className="mt-0.5 pl-2 pb-1 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   SUBMENU ITEM  (inside an expanded NavGroup)
───────────────────────────────────────────────────────────── */
const SubItem = ({ to, label, exact = false }) => {
  const { closeMobile } = useSidebar();
  return (
    <NavLink
      to={to}
      end={exact}
      onClick={closeMobile}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 pl-8 pr-3 py-1.5 text-[12.5px] rounded-[6px] transition-colors duration-150',
          isActive
            ? 'bg-white/15 text-white font-semibold'
            : 'text-[#A1CAFA] hover:bg-white/10 hover:text-white'
        )
      }
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0" />
      {label}
    </NavLink>
  );
};

/* ─────────────────────────────────────────────────────────────
   SECTION LABEL  (hidden when collapsed)
───────────────────────────────────────────────────────────── */
const SectionLabel = ({ label }) => {
  const { isCollapsed } = useSidebar();
  if (isCollapsed) return <div className="h-2" />;
  return (
    <div className="px-4 pt-4 pb-1.5">
      <p className="text-[10.5px] uppercase tracking-[0.1em] font-bold text-[#A1CAFA] select-none">
        {label}
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   SIDEBAR SEPARATOR
───────────────────────────────────────────────────────────── */
const SidebarSep = () => (
  <div className="mx-4 my-2 border-t border-white/10" />
);

/* ─────────────────────────────────────────────────────────────
   MAIN SIDEBAR COMPONENT
───────────────────────────────────────────────────────────── */
const Sidebar = () => {
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* ── Mobile overlay backdrop ─────────────────────────── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-[150] bg-black/50 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ───────────────────────────────────── */}
      <aside
        style={{
          background: 'var(--sidebar-bg)',
          width: isCollapsed ? '68px' : '220px',
          transition: 'width 220ms ease-in-out',
          borderRight: '1px solid var(--sidebar-border)',
        }}
        className={cn(
          'flex flex-col flex-shrink-0 h-full overflow-hidden z-[160]',
          'fixed lg:relative',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* ── Brand area ─────────────────────────────────────── */}
        <div
          className="flex items-center flex-shrink-0 h-16 px-3"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          {/* Logo icon — always visible, centered when collapsed */}
          <div
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-[9px] bg-white flex-shrink-0 shadow-md',
              isCollapsed && 'mx-auto'
            )}
          >
            <Activity className="h-5 w-5 text-[#2482ED]" />
          </div>

          {/* Brand text — fades out when collapsed */}
          {!isCollapsed && (
            <div className="ml-2.5 overflow-hidden">
              <span className="text-[15px] font-bold text-white leading-tight block whitespace-nowrap">
                MediShop
              </span>
              <span className="text-[10px] font-semibold text-[#D0E4FC] tracking-widest whitespace-nowrap uppercase">
                ERP Platform
              </span>
            </div>
          )}

          {/* Mobile close button (only in expanded drawer) */}
          {!isCollapsed && (
            <button
              onClick={closeMobile}
              className="lg:hidden ml-auto flex items-center justify-center w-7 h-7 rounded-md text-[#D0E4FC] hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Navigation ─────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-2">

          {/* Dashboard */}
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" exact />

          {/* ── SALES ─────────────────────────────────────── */}
          <PermissionGuard permissions={['billing.create', 'discounts.view']}>
            <SectionLabel label="Sales" />
            <NavGroup
              icon={ShoppingCart}
              label="Sales & Billing"
              paths={['/billing', '/sales/returns', '/discounts']}
            >
              <SubItem to="/billing" label="New Bill (POS)" exact />
              <SubItem to="/billing/history" label="Sales History" />
              <SubItem to="/sales/returns" label="Sales Returns" />
              <SubItem to="/discounts" label="Discount Management" />
            </NavGroup>
          </PermissionGuard>

          {/* ── PROCUREMENT ─────────────────────────────────── */}
          <PermissionGuard permission="purchases.view">
            <SectionLabel label="Procurement" />
            <NavGroup
              icon={FileText}
              label="Purchases"
              paths={['/purchases']}
            >
              <SubItem to="/purchases" label="Purchase Orders" exact />
              <SubItem to="/purchases/new" label="New Purchase" />
              <SubItem to="/purchases/returns" label="Purchase Returns" />
            </NavGroup>
          </PermissionGuard>

          {/* ── CATALOGUE ───────────────────────────────────── */}
          <PermissionGuard permission="medicines.view">
            <SectionLabel label="Catalogue" />
            <NavGroup
              icon={Pill}
              label="Medicines"
              paths={['/medicines']}
            >
              <SubItem to="/medicines" label="All Medicines" exact />
              <SubItem to="/medicines/add" label="Add Medicine" />
              <SubItem to="/medicines/alternatives" label="Alternatives" />
            </NavGroup>
          </PermissionGuard>

          {/* ── INVENTORY ───────────────────────────────────── */}
          <PermissionGuard permission="inventory.view">
            <NavGroup
              icon={Package}
              label="Inventory"
              paths={['/inventory']}
            >
              <SubItem to="/inventory" label="Current Stock" exact />
              <SubItem to="/inventory/low-stock" label="Low Stock" />
              <SubItem to="/inventory/out-of-stock" label="Out of Stock" />
              <SubItem to="/inventory/expiry" label="Expiry Management" />
              {/* <SubItem to="/inventory/fefo" label="FEFO Recommendations" /> */}
              <SubItem to="/inventory/transactions" label="Transactions" />
              <SubItem to="/inventory/reorder" label="Reorder Recommendations" />
            </NavGroup>
          </PermissionGuard>

          {/* ── STAKEHOLDERS ─────────────────────────────────── */}
          <SectionLabel label="Stakeholders" />
          <PermissionGuard permission="customers.view">
            <NavItem to="/customers" icon={Users} label="Customers" />
          </PermissionGuard>
          <PermissionGuard permission="suppliers.view">
            <NavItem to="/suppliers" icon={Building} label="Suppliers" />
          </PermissionGuard>
          <PermissionGuard permission="billing.payment">
            <NavItem to="/payments" icon={CreditCard} label="Payments" />
          </PermissionGuard>

          {/* ── ANALYTICS ────────────────────────────────────── */}
          <PermissionGuard permissions={['reports.sales', 'reports.purchases', 'reports.inventory']}>
            <SectionLabel label="Analytics" />
            <NavGroup
              icon={BarChart2}
              label="Reports & Analytics"
              paths={['/reports', '/analytics']}
            >
              <SubItem to="/reports" label="Reports Dashboard" exact />
              <SubItem to="/analytics/bi" label="Business Intelligence" />
              <SubItem to="/analytics/predictions" label="Stock Prediction" />
            </NavGroup>
          </PermissionGuard>

          {/* ── MARKETING ────────────────────────────────────── */}
          {/* <PermissionGuard permission="marketing.campaigns">
            <NavGroup
              icon={Megaphone}
              label="Marketing"
              paths={['/marketing']}
            >
              <SubItem to="/marketing/campaigns" label="Campaigns" exact />
              <SubItem to="/marketing/qr" label="QR Management" />
              <SubItem to="/marketing/analytics" label="Marketing Analytics" />
            </NavGroup>
          </PermissionGuard> */}

          {/* ── SYSTEM ───────────────────────────────────────── */}
          <SidebarSep />
          <NavItem to="/notifications" icon={Bell} label="Notifications" />

          <PermissionGuard permission="staff.view">
            <NavGroup
              icon={Shield}
              label="Access Control"
              paths={['/staff', '/roles', '/audit-logs', '/sessions']}
            >
              <SubItem to="/staff" label="Staff List" />
              <SubItem to="/roles" label="Roles & Permissions" />
              <SubItem to="/audit-logs" label="Audit Logs" />
              <SubItem to="/sessions" label="Active Sessions" />
            </NavGroup>
          </PermissionGuard>

          <PermissionGuard permission="settings.view">
            <NavItem to="/settings" icon={Settings} label="Settings" />
          </PermissionGuard>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
