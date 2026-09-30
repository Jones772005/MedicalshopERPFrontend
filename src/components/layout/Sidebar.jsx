import { NavLink, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Building,
  FileText, Activity, CreditCard, BarChart2, Bell, Shield, Settings,
  ChevronDown, ChevronRight, Pill, X
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
            'flex items-center transition-all duration-150 rounded-[12px]',
            isCollapsed
              ? 'justify-center h-11 mx-[7px] my-[3px]'
              : 'px-[14px] py-[10px] gap-[12px] mx-[10px] my-[2px]',
            isActive
              ? 'text-white shadow-sm'
              : 'text-[#C8DEFF] hover:bg-white/[0.09] hover:text-white'
          )
        }
        style={({ isActive }) =>
          isActive ? { background: 'rgba(72, 142, 245, 0.75)' } : undefined
        }
      >
        {Icon && (
          <Icon
            className={cn(
              'flex-shrink-0 transition-colors duration-150',
              isCollapsed ? 'h-5 w-5' : 'h-[18px] w-[18px]'
            )}
          />
        )}
        {!isCollapsed && (
          <span className="text-[14px] font-semibold truncate flex-1 leading-none">{label}</span>
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
            'flex items-center justify-center h-11 my-[3px] rounded-[12px] transition-all duration-150 cursor-pointer',
            'w-[calc(100%-14px)]',
            isAnyChildActive
              ? 'text-white shadow-sm'
              : 'text-[#C8DEFF] hover:bg-white/[0.09] hover:text-white'
          )}
          style={isAnyChildActive ? { background: 'rgba(72, 142, 245, 0.75)' } : undefined}
        >
          <Icon className="h-5 w-5" />
        </button>
      </div>
    );
  }

  // ── EXPANDED MODE ──────────────────────────────────────────
  return (
    <div className="mx-[10px] my-[2px]">
      <button
        onClick={() => setIsOpen(o => !o)}
        className={cn(
          'w-full flex items-center justify-between px-[14px] py-[10px] text-[14px] font-semibold rounded-[12px] transition-all duration-150 cursor-pointer leading-none',
          isAnyChildActive
            ? 'text-white'
            : 'text-[#C8DEFF] hover:bg-white/[0.09] hover:text-white'
        )}
        style={isAnyChildActive ? { background: 'rgba(72, 142, 245, 0.75)' } : undefined}
      >
        <div className="flex items-center gap-[12px]">
          <Icon
            className={cn(
              'h-[18px] w-[18px] flex-shrink-0',
              isAnyChildActive ? 'text-white' : 'text-[#A8CAFF]'
            )}
          />
          <span>{label}</span>
        </div>
        {isOpen
          ? <ChevronDown className="h-3.5 w-3.5 opacity-60 flex-shrink-0" />
          : <ChevronRight className="h-3.5 w-3.5 opacity-60 flex-shrink-0" />
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
          'flex items-center gap-2.5 pl-[48px] pr-3 py-[8px] text-[13px] rounded-[8px] transition-all duration-150',
          isActive
            ? 'bg-white/15 text-white font-semibold'
            : 'text-[#A8CAFF] hover:bg-white/[0.09] hover:text-white'
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
  if (isCollapsed) return <div className="h-3" />;
  return (
    <div className="px-[14px] pt-[22px] pb-[8px]">
      <p
        className="text-[10.5px] uppercase tracking-[0.14em] font-bold select-none"
        style={{ color: 'var(--sidebar-section-label, #8AB4F8)' }}
      >
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
   SIDEBAR FOOTER  — fixed at bottom, never scrolls
   Structure: flex-shrink-0 outside the scrolling nav
───────────────────────────────────────────────────────────── */
const SidebarFooter = ({ isCollapsed }) => (
  <div
    className="sidebar-footer"
    style={{
      borderTop: '1px solid rgba(255,255,255,0.15)',
      minHeight: isCollapsed ? '60px' : '92px',
    }}
  >
    {/* Decorative shapes — all purely presentational */}
    <div className="sidebar-footer-arc" aria-hidden="true" />
    <div className="sidebar-footer-blob1" aria-hidden="true" />
    <div className="sidebar-footer-blob2" aria-hidden="true" />

    <div
      className={cn(
        'relative z-10 flex flex-col items-center text-center',
        isCollapsed ? 'py-3' : 'py-5 px-3'
      )}
    >
      {/* Decorative icon badge */}
      <div
        className="mb-2 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.12)' }}
        aria-hidden="true"
      >
        <Activity className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.55)' }} />
      </div>

      {!isCollapsed && (
        <p
          className="text-[11px] font-bold uppercase tracking-[0.12em] leading-[1.65] select-none"
          style={{ color: 'rgba(170, 210, 255, 0.80)' }}
        >
          DEVELOPED BY CODE BLAZA
          <br />
          TECHNOLOGY
        </p>
      )}
    </div>
  </div>
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
          width: isCollapsed ? '68px' : '240px',
          transition: 'width 220ms ease-in-out',
          borderRight: '1px solid var(--sidebar-border)',
        }}
        className={cn(
          /* flex-col + h-full ensures nav scrolls independently and footer stays fixed */
          'flex flex-col flex-shrink-0 h-full overflow-hidden z-[160]',
          'fixed lg:relative',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* ── Brand area ─────────────────────────────────────── */}
        <div
          className="flex items-center flex-shrink-0 h-16 px-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}
        >
          {/* Logo icon — always visible, centred when collapsed */}
          <div
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-[9px] bg-white flex-shrink-0 shadow-md',
              isCollapsed && 'mx-auto'
            )}
          >
            <Activity className="h-5 w-5 text-[#153FA8]" />
          </div>

          {/* Brand text — hidden when collapsed */}
          {!isCollapsed && (
            <div className="ml-2.5 overflow-hidden">
              <span className="text-[15px] font-bold text-white leading-tight block whitespace-nowrap">
                MediShop
              </span>
              <span
                className="text-[10px] font-semibold tracking-widest whitespace-nowrap uppercase"
                style={{ color: '#A8CAFF' }}
              >
                ERP Platform
              </span>
            </div>
          )}

          {/* Mobile close button (only in expanded drawer) */}
          {!isCollapsed && (
            <button
              onClick={closeMobile}
              className="lg:hidden ml-auto flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              style={{ color: '#D4E6FF' }}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Navigation — flex-1 so it fills space; overflow-y-auto so it scrolls ── */}
        {/* footer sits OUTSIDE this nav as a flex-shrink-0 sibling                   */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto py-2">

          {/* Dashboard */}
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" exact />

          {/* ── SALES ─────────────────────────────────────── */}
          <PermissionGuard permissions={['pos.create', 'discounts.view']}>
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
              <SubItem to="/sales/medicine-requests" label="Medicine Requests" />
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

              <SubItem to="/purchases/returns" label="Purchase Returns" />
            </NavGroup>
          </PermissionGuard>

          {/* ── CATALOGUE ───────────────────────────────────── */}
          <PermissionGuard permission="medicines.view">
            <SectionLabel label="Catalogue" />
            <NavItem to="/medicines" icon={Pill} label="Medicines" />
          </PermissionGuard>

          {/* ── INVENTORY ───────────────────────────────────── */}
          <PermissionGuard permission="inventory.stock.view">
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
          <PermissionGuard permission="payments.view">
            <NavItem to="/payments" icon={CreditCard} label="Payments" />
          </PermissionGuard>

          {/* ── ANALYTICS ────────────────────────────────────── */}
          <PermissionGuard permissions={['reports.sales.view', 'reports.purchases.view', 'reports.inventory.view']}>
            <SectionLabel label="Analytics" />
            <NavGroup
              icon={BarChart2}
              label="Reports & Analytics"
              paths={['/reports']}
            >
              <SubItem to="/reports/sales" label="Sales Report" />
              <SubItem to="/reports/purchases" label="Purchases Report" />
              <SubItem to="/reports/inventory" label="Inventory Report" />
              <SubItem to="/reports/financial" label="Financial Report" />
              <SubItem to="/reports/tax" label="Tax Report" />
              <SubItem to="/reports/customers" label="Customers Report" />
              <SubItem to="/reports/suppliers" label="Suppliers Report" />
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

          <PermissionGuard permission="settings.pharmacy.view">
            <NavItem to="/settings" icon={Settings} label="Settings" />
          </PermissionGuard>
        </nav>

        {/* ── Footer — anchored to bottom, never scrolls ─────── */}
        <SidebarFooter isCollapsed={isCollapsed} />
      </aside>
    </>
  );
};

export default Sidebar;
