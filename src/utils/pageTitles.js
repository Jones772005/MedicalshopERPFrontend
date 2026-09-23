import {
  LayoutDashboard, ShoppingCart, Package, Users, Building, FileText,
  Activity, CreditCard, BarChart2, Bell, Shield, Settings, Megaphone,
  Pill, FileEdit, ClipboardList, TrendingUp, Key, Printer, Database,
  User, CheckSquare, History
} from 'lucide-react';

/**
 * Resolves a human-readable page title from a React Router pathname.
 * Keeps a single source of truth — the same labels used in sidebar nav.
 *
 * Ordered from most-specific to least-specific so that the first match wins.
 */
const ROUTE_TITLES = [
  // ── Medicines ────────────────────────────────────────
  { pattern: /^\/medicines\/add$/,              title: 'Add Medicine', icon: Pill },
  { pattern: /^\/medicines\/alternatives$/,     title: 'Alternative Medicines', icon: Pill },
  { pattern: /^\/medicines\/[^/]+\/edit$/,      title: 'Edit Medicine', icon: FileEdit },
  { pattern: /^\/medicines\/[^/]+$/,            title: 'Medicine Details', icon: Pill },
  { pattern: /^\/medicines$/,                   title: 'Medicines', icon: Pill },

  // ── Inventory ─────────────────────────────────────────
  { pattern: /^\/inventory\/low-stock$/,        title: 'Low Stock', icon: Activity },
  { pattern: /^\/inventory\/out-of-stock$/,     title: 'Out of Stock', icon: Activity },
  { pattern: /^\/inventory\/expiry$/,           title: 'Expiry Management', icon: CheckSquare },
  { pattern: /^\/inventory\/fefo$/,             title: 'FEFO Recommendations', icon: CheckSquare },
  { pattern: /^\/inventory\/transactions$/,     title: 'Stock Transactions', icon: History },
  { pattern: /^\/inventory\/reorder$/,          title: 'Reorder Recommendations', icon: TrendingUp },
  { pattern: /^\/inventory$/,                   title: 'Current Stock', icon: Package },

  // ── Customers ─────────────────────────────────────────
  { pattern: /^\/customers\/add$/,              title: 'Add Customer', icon: Users },
  { pattern: /^\/customers\/[^/]+\/edit$/,      title: 'Edit Customer', icon: FileEdit },
  { pattern: /^\/customers\/[^/]+$/,            title: 'Customer Details', icon: Users },
  { pattern: /^\/customers$/,                   title: 'Customers', icon: Users },

  // ── Suppliers ─────────────────────────────────────────
  { pattern: /^\/suppliers\/add$/,              title: 'Add Supplier', icon: Building },
  { pattern: /^\/suppliers\/[^/]+\/edit$/,      title: 'Edit Supplier', icon: FileEdit },
  { pattern: /^\/suppliers\/[^/]+$/,            title: 'Supplier Details', icon: Building },
  { pattern: /^\/suppliers$/,                   title: 'Suppliers', icon: Building },

  // ── Purchases ─────────────────────────────────────────
  { pattern: /^\/purchases\/new$/,              title: 'New Purchase', icon: FileText },
  { pattern: /^\/purchases\/returns\/[^/]+$/,   title: 'Purchase Return Details', icon: ClipboardList },
  { pattern: /^\/purchases\/returns$/,          title: 'Purchase Returns', icon: ClipboardList },
  { pattern: /^\/purchases\/[^/]+\/receive$/,   title: 'Receive Goods', icon: Package },
  { pattern: /^\/purchases\/[^/]+$/,            title: 'Purchase Details', icon: FileText },
  { pattern: /^\/purchases$/,                   title: 'Purchase Orders', icon: FileText },

  // ── Billing & Sales ───────────────────────────────────
  { pattern: /^\/billing\/history$/,            title: 'Sales History', icon: History },
  { pattern: /^\/billing\/invoice\/[^/]+$/,     title: 'Invoice', icon: FileText },
  { pattern: /^\/billing$/,                     title: 'New Bill (POS)', icon: ShoppingCart },
  { pattern: /^\/sales\/returns\/new$/,         title: 'New Sales Return', icon: ClipboardList },
  { pattern: /^\/sales\/returns\/[^/]+$/,       title: 'Sales Return Details', icon: ClipboardList },
  { pattern: /^\/sales\/returns$/,              title: 'Sales Returns', icon: ClipboardList },

  // ── Discounts ─────────────────────────────────────────
  { pattern: /^\/discounts\/new$/,              title: 'New Discount', icon: Settings },
  { pattern: /^\/discounts\/[^/]+\/edit$/,      title: 'Edit Discount', icon: FileEdit },
  { pattern: /^\/discounts\/[^/]+$/,            title: 'Discount Details', icon: Settings },
  { pattern: /^\/discounts$/,                   title: 'Discount Management', icon: Settings },

  // ── Payments ──────────────────────────────────────────
  { pattern: /^\/payments$/,                    title: 'Payments', icon: CreditCard },

  // ── Reports ───────────────────────────────────────────
  { pattern: /^\/reports\/sales$/,              title: 'Sales Report', icon: BarChart2 },
  { pattern: /^\/reports\/purchases$/,          title: 'Purchases Report', icon: BarChart2 },
  { pattern: /^\/reports\/inventory$/,          title: 'Inventory Report', icon: BarChart2 },
  { pattern: /^\/reports\/financial$/,          title: 'Financial Report', icon: BarChart2 },
  { pattern: /^\/reports\/tax$/,                title: 'Tax Report', icon: BarChart2 },
  { pattern: /^\/reports\/customers$/,          title: 'Customers Report', icon: Users },
  { pattern: /^\/reports\/suppliers$/,          title: 'Suppliers Report', icon: Building },
  { pattern: /^\/reports$/,                     title: 'Reports & Analytics', icon: BarChart2 },

  // ── Analytics ─────────────────────────────────────────
  { pattern: /^\/analytics\/bi$/,               title: 'Business Intelligence', icon: TrendingUp },
  { pattern: /^\/analytics\/predictions$/,      title: 'Stock Prediction', icon: TrendingUp },

  // ── Marketing ─────────────────────────────────────────
  { pattern: /^\/marketing\/campaigns\/new$/,   title: 'New Campaign', icon: Megaphone },
  { pattern: /^\/marketing\/campaigns$/,        title: 'Campaigns', icon: Megaphone },
  { pattern: /^\/marketing\/qr$/,               title: 'QR Management', icon: Megaphone },
  { pattern: /^\/marketing\/analytics$/,        title: 'Marketing Analytics', icon: BarChart2 },

  // ── Staff / Roles / Security ──────────────────────────
  { pattern: /^\/staff\/add$/,                  title: 'Add Staff', icon: Shield },
  { pattern: /^\/staff\/[^/]+\/edit$/,          title: 'Edit Staff', icon: Shield },
  { pattern: /^\/staff\/[^/]+$/,                title: 'Staff Details', icon: Shield },
  { pattern: /^\/staff$/,                       title: 'Staff List', icon: Shield },
  { pattern: /^\/roles\/[^/]+\/edit$/,          title: 'Edit Role', icon: Key },
  { pattern: /^\/roles\/[^/]+$/,                title: 'Role Details', icon: Key },
  { pattern: /^\/roles$/,                       title: 'Roles & Permissions', icon: Key },
  { pattern: /^\/audit-logs$/,                  title: 'Audit Logs', icon: History },
  { pattern: /^\/sessions$/,                    title: 'Active Sessions', icon: Activity },

  // ── Settings ──────────────────────────────────────────
  { pattern: /^\/settings\/pharmacy$/,          title: 'Pharmacy Settings', icon: Settings },
  { pattern: /^\/settings\/invoice$/,           title: 'Invoice Settings', icon: FileText },
  { pattern: /^\/settings\/tax$/,               title: 'Tax Settings', icon: Settings },
  { pattern: /^\/settings\/notifications$/,     title: 'Notification Settings', icon: Bell },
  { pattern: /^\/settings\/printer$/,           title: 'Printer Settings', icon: Printer },
  { pattern: /^\/settings\/barcode$/,           title: 'Barcode Settings', icon: Settings },
  { pattern: /^\/settings\/qr$/,                title: 'QR Settings', icon: Settings },
  { pattern: /^\/settings\/security$/,          title: 'Security Settings', icon: Shield },
  { pattern: /^\/settings\/backup$/,            title: 'Backup & Restore', icon: Database },
  { pattern: /^\/settings\/system$/,            title: 'System Administration', icon: Settings },
  { pattern: /^\/settings$/,                    title: 'Settings', icon: Settings },

  // ── Misc ──────────────────────────────────────────────
  { pattern: /^\/notifications$/,               title: 'Notifications', icon: Bell },
  { pattern: /^\/profile$/,                     title: 'My Profile', icon: User },
  { pattern: /^\/dashboard$/,                   title: 'Dashboard', icon: LayoutDashboard },
];

/**
 * Returns the page title for a given pathname.
 * Falls back to a capitalised version of the last path segment.
 */
export function resolvePageTitle(pathname) {
  for (const { pattern, title, icon } of ROUTE_TITLES) {
    if (pattern.test(pathname)) return { title, Icon: icon };
  }
  // Fallback: capitalise last segment
  const last = pathname.split('/').filter(Boolean).pop() ?? '';
  const title = last
    ? last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ')
    : 'MediShop ERP';
  return { title, Icon: LayoutDashboard };
}
