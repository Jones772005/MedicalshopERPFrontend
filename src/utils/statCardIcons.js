import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  AlertTriangle,
  AlertCircle,
  Clock,
  CreditCard,
  RotateCcw,
  Users,
  Building2,
  FileText,
  Pill,
  Receipt,
  Tag,
  Megaphone,
  Wallet,
  BarChart3,
  CheckCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  IndianRupee,
} from 'lucide-react';

/**
 * Centralized title-to-icon+color mapping for StatCard.
 *
 * Order matters: more-specific patterns must come before generic ones.
 * Each entry: [keywords-to-match, LucideIcon, fallbackColor]
 *
 * The fallbackColor is only used when the caller does NOT pass a `color` prop.
 */
const TITLE_ICON_MAP = [
  // --- Refund / Return (specific before generic) ---
  [['pending refund'],              Clock,            'warning'],
  [['refund amount', 'total refund'], IndianRupee,    'danger'],
  [['refunded'],                    CheckCircle,      'success'],
  [['refund'],                      RotateCcw,        'danger'],
  [['return value'],                IndianRupee,      'danger'],
  [['return'],                      RotateCcw,        'primary'],

  // --- Tax / GST ---
  [['output tax', 'sales gst'],     Receipt,          'primary'],
  [['input tax', 'purchase gst'],   Receipt,          'info'],
  [['tax payable', 'tax credit'],   Receipt,          'warning'],
  [['tax collected', 'tax'],        Receipt,          'warning'],

  // --- Stock / Inventory ---
  [['out of stock'],                AlertCircle,      'danger'],
  [['low stock'],                   AlertTriangle,    'warning'],
  [['near expiry'],                 Clock,            'danger'],
  [['expired'],                     AlertCircle,      'danger'],
  [['stock value'],                 IndianRupee,      'primary'],
  [['stock', 'inventory value', 'inventory'], Package, 'info'],

  // --- Sales ---
  [['avg bill'],                    BarChart3,        'primary'],
  [['sales count', 'total sales (count)'], FileText,  'info'],
  [['total sales'],                 ShoppingCart,     'success'],
  [['sales revenue', 'revenue'],    DollarSign,       'success'],
  [['sales'],                       DollarSign,       'success'],

  // --- Purchases ---
  [['purchase order', 'total purchase orders'], ShoppingCart, 'info'],
  [['purchase value', 'total purchase value'], IndianRupee, 'primary'],
  [['total purchases'],               ShoppingCart,     'info'],
  [['purchase'],                    ShoppingCart,     'warning'],

  // --- Profit ---
  [['net profit', 'profit'],        TrendingUp,       'primary'],

  // --- Expenses / COGS ---
  [['cogs', 'expense'],             Wallet,           'danger'],

  // --- Payments ---
  [['total incoming', 'incoming'],  ArrowDownCircle,  'success'],
  [['total outgoing', 'outgoing'],  ArrowUpCircle,    'danger'],
  [['pending pay'],                 Clock,            'warning'],
  [['payment'],                     CreditCard,       'primary'],

  // --- Outstanding ---
  [['outstanding'],                 Clock,            'warning'],

  // --- Received ---
  [['received'],                    CheckCircle,      'success'],

  // --- Pending (generic — after specific pendings) ---
  [['pending order'],               Clock,            'warning'],
  [['pending'],                     Clock,            'warning'],

  // --- Paid ---
  [['total paid', 'paid'],          CheckCircle,      'success'],

  // --- Customers ---
  [['customer'],                    Users,            'primary'],

  // --- Suppliers ---
  [['supplier'],                    Building2,        'info'],

  // --- Medicines ---
  [['medicine'],                    Pill,             'primary'],

  // --- Staff ---
  [['staff'],                       Users,            'info'],

  // --- Bills / Invoices ---
  [['invoice', 'bill'],             FileText,         'info'],

  // --- Discount ---
  [['discount'],                    Tag,              'warning'],

  // --- Marketing / Campaigns ---
  [['campaign', 'marketing'],       Megaphone,        'primary'],

  // --- Orders ---
  [['order'],                       FileText,         'info'],
];

/**
 * Given a StatCard title, returns { icon: LucideComponent, color: string }
 * Returns a neutral fallback if no match is found.
 */
export const resolveStatCardIcon = (title) => {
  if (!title) return { icon: BarChart3, color: 'primary' };

  const normalized = title.toLowerCase().trim();

  for (const [keywords, icon, color] of TITLE_ICON_MAP) {
    if (keywords.some(kw => normalized.includes(kw))) {
      return { icon, color };
    }
  }

  // Neutral fallback
  return { icon: BarChart3, color: 'primary' };
};
