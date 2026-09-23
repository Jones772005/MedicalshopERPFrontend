# Medical ERP UI/UX Reference Analysis

> [!NOTE]
> This document is a comprehensive UI/UX extraction from the Medical Billing ERP project. It focuses strictly on visual design, component patterns, layout structures, and user experience paradigms. Business logic and workflows present in the reference project have not been evaluated for correctness and should not be treated as authoritative.

---

## 1. Executive UI Summary
The application is a modern, responsive single-page application (SPA) built using React 19, Vite, and Tailwind CSS. It employs a clean, data-dense interface typical of B2B SaaS and ERP platforms. 
- **Frontend Framework**: React 19 (Vite)
- **CSS Framework**: Tailwind CSS (with bespoke `@layer components` abstractions)
- **Icon Library**: Lucide React
- **Charting**: Recharts
- **Theme Support**: Light mode only (no dark mode configured in the design tokens)
- **Design Paradigm**: Flat design with subtle glassmorphism/shadowing (card-based layout).

## 2. Design System
The design system heavily relies on CSS variables and Tailwind configuration abstractions. It establishes a unified visual language through strict adherence to defined tokens for colors, spacing, radius, and typography.
- **Border Radius**: 
  - `sm`: 6px
  - `DEFAULT`: 8px
  - `md`: 10px
  - `lg`: 12px
  - `xl`: 14px
  - `2xl`: 16px
- **Shadows**:
  - `xs`: 0 1px 2px 0 rgba(0,0,0,0.05)
  - `sm`: 0 1px 3px 0 rgba(0,0,0,0.07)
  - `card`: 0 1px 3px 0 rgba(36,130,237,0.06)
  - `card-hover`: 0 4px 16px -2px rgba(36,130,237,0.12)
- **Animations**: Subtle fade-ins (`fade-in`), directional slides (`slide-in-down/up/left/right`), and scaling (`scale-in`) (150ms-200ms duration).

## 3. Color System
The color system utilizes a primary brand blue, a secondary brand green, neutral slates for text/surfaces, and semantic colors for states.

**Brand Colors:**
- `brand-blue`: #2482ED (Primary Action)
- `brand-blue-dark`: #1a6bc7 (Hover State)
- `brand-blue-50`: #eef5fd (Active Backgrounds)
- `brand-green`: #24EDBB (Success Actions/Accents)

**Neutral (Slate):**
- `slate-50`: #f8fafc (App Background)
- `slate-200`: #e2e8f0 (Borders/Dividers)
- `slate-500`: #64748b (Secondary Text)
- `slate-800`: #1e293b (Primary Text/Headings)

**Semantic (Status):**
- **Success**: Text `#166534`, BG `#f0fdf4`, Border `#bbf7d0`
- **Warning**: Text `#92400e`, BG `#fffbeb`, Border `#fde68a`
- **Error/Danger**: Text `#991b1b`, BG `#fef2f2`, Border `#fecaca`
- **Info**: Text `#1e40af`, BG `#eff6ff`, Border `#bfdbfe`

## 4. Typography
- **Font Family**: 'Inter', system-ui, sans-serif
- **Scale**:
  - `2xs`: 10px / 14px (Badges, helpers)
  - `xs`: 12px / 16px (Table headers, secondary info)
  - `sm`: 13px / 18px (Standard body, table cells)
  - `base`: 14px / 20px (Default text)
  - `lg`/`xl`/`2xl`/`3xl`: For headings and KPI metrics
- **Weights**: 300, 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold), 800 (Extra Bold)

## 5. Spacing
Based on an 8px grid system with half-steps:
- `0.5`: 4px
- `1`: 8px
- `1.5`: 12px
- `2`: 16px
- `2.5`: 20px
- `3`: 24px
- `4`: 32px

## 6. Layout
The application uses a persistent **AppShell** layout:
- **Container**: `h-screen flex bg-slate-50 overflow-hidden`
- **Sidebar**: Fixed on the left (`w-[240px]` expanded).
- **Main Area**: Fills the remaining width.
- **Header**: Fixed at the top of the main area (`h-[76px]`).
- **Content Area**: `px-5 py-4 w-full` padding inside a scrollable `<main>` block. No explicit max-width; it fluidly fills the space.

## 7. Sidebar
- **Width**: `w-[240px]` (Expanded), `w-[72px]` (Collapsed).
- **Background**: Gradient from `#1a56db` to `#0c3286`. Text is white.
- **Brand Area**: `h-[76px]` fixed height, white background, shadow-sm. Features a square icon (`w-9 h-9`) with `#1ac9a0` background.
- **Groups**: Navigation is split into categories (Overview, Billing, Inventory, etc.) separated by uppercase, tracked-out micro-labels (`text-[10px] uppercase tracking-wider`).
- **Links**: `px-3 py-2.5 rounded-lg`. Active state uses `bg-blue-500 shadow-md` with white text. Inactive state uses `text-blue-100` fading to white on hover.

## 8. Header
- **Height**: `76px` with a bottom border (`border-slate-200`) and slight shadow.
- **Components**:
  - **Left**: Mobile/Desktop sidebar toggle buttons (Hamburger menu).
  - **Center**: Global search bar (rounded-full, `pl-12 pr-4`, search icon inside).
  - **Right**: Sync status indicator, Notification bell (with red badge), User Profile dropdown.
- **User Profile**: Pill-shaped button, displaying an avatar (gradient background with initials) and user name/role beside it.
- **Dropdowns**: Pop out with `animate-in slide-in-down` utility, featuring border and `shadow-xl`.

## 9. Dashboard
- **Greeting**: Personalised `Good morning/afternoon, {Name}` accompanied by the current date.
- **KPI Cards**: A grid layout (`grid-cols-2 md:grid-cols-3 lg:grid-cols-6`).
  - Cards feature a left-aligned icon in a colored square, value (`text-2xl font-bold`), and label (`text-xs`).
  - Hover effect shifts the card up 1px (`-translate-y-px`) with an increased shadow (`shadow-card-hover`).
- **Charts**: Recharts-based Line Chart for 30-day sales and Pie Chart for Payment Mix.
- **Alerts**: Sections for "Active Shifts", "Low Stock Alerts", and "Expiry Alerts" using tight list layouts with status badges.

## 10. Tables
- **Component**: Standard HTML `<table>` using a `.data-table` utility class.
- **Header**: `bg-[#1ac9a0]` (Brand green) with white text. `text-xs uppercase tracking-wide px-3 py-2.5 text-left`.
- **Rows**: Hover state (`hover:bg-slate-50`), `px-3 py-2.5 text-slate-700`, bordered cells.
- **Actions**: Usually presented as small icon buttons (`btn-ghost btn-sm btn-icon`) in the last column.
- **Pagination**: Minimal, table structures handle scrolling vertically if needed.

## 11. Forms
- **Input Styling**: `.form-input` class. Height `40px` (or `44px` for large), bordered (`border-slate-200`), rounded (`6px`). 
- **Focus State**: `border-brand-blue ring-2 ring-brand-blue/10`.
- **Labels**: `.form-label`, `text-xs font-medium text-slate-700 mb-1`.
- **Required**: Red asterisk.
- **Selects**: Custom dropdown caret via inline SVG background image.
- **Error States**: Input borders turn red (`border-red-400`), helper text becomes `.form-error` (`text-2xs text-red-600 mt-1`).

## 12. Buttons
Base class `.btn` sets `h-36px`, rounded corners, and focus states.
- **Primary**: `bg-brand-blue text-white` with a blue shadow.
- **Secondary**: `bg-white text-slate-700 border-slate-200`.
- **Success**: `bg-brand-green text-slate-900`.
- **Danger**: `bg-red-600 text-white`.
- **Outline**: Transparent background with blue border and blue text.
- **Ghost**: Transparent, hover state turns `bg-slate-100`.
- **Sizes**: `btn-sm` (28px), default (36px), `btn-lg` (44px), `btn-xl` (52px).

## 13. Cards
- **Base Card**: `.card` uses `bg-white rounded-lg border-slate-200 shadow-card`.
- **Header**: `.card-header` features `px-3 py-2.5 border-b` with a title (`text-sm font-semibold`) and optional action button on the right.
- **Body**: `.card-body` sets `p-3`.

## 14. Modals
- **Overlay**: `bg-slate-900/50` (or `/60`).
- **Container**: Positioned fixed in center. `.card shadow-xl animate-in scale-in`. 
- **Widths**: Varying `max-w-md`, `max-w-lg`, `max-w-sm`.
- **Header**: Contains title and a close (`X`) icon button.
- **Footer/Actions**: Typically two buttons, a Secondary "Cancel/Back" and a Primary/Success "Confirm" button. Flex gap used for spacing.

## 15. Status Badges
- **Shape**: Pill (`rounded-full`), `.badge` class with `px-2 py-0.5 text-[11px]`.
- **Variants**:
  - `badge-blue`: Light blue BG, Blue text/border.
  - `badge-green`: Light green BG, Emerald text/border (Success, Paid, Active).
  - `badge-red`: Light red BG, Red text/border (Error, Cancelled, Out of Stock, Expired).
  - `badge-amber`: Light yellow BG, Amber text/border (Warning, Pending, Low Stock).
  - `badge-gray`: Slate BG, Slate text.
  - `badge-purple`: Purple BG (used for credit balance).

## 16. Notifications
- **Trigger**: Bell icon in header with a red dot badge (`w-1.5 h-1.5`) when unread.
- **Dropdown**: `w-80` width. Contains header with "Mark all read".
- **Items**: Rows with an icon (circular background), title, message, and timestamp. Unread items have a slight blue background (`bg-blue-50/30`) and a blue dot indicator.

## 17. POS (Point of Sale)
**Layout:** 3-Column structural layout for fast interaction.
- **Header Top**: Displays active terminal, active shift, and current clock.
- **Left Column (w-1/3)**: Product Search (input with barcode icon), horizontal scrolling category chips, and a scrollable list of product cards.
- **Center Column (flex-1)**: "Current Bill" table showing Qty controls (+/-), Price, Discount, Total. Bottom section has a prominent "+ Add Product (F2)" dashed button.
- **Right Column (not explicitly listed but logically present)**: Customer selection, total calculation (Subtotal, GST, Discount), and prominent Checkout/Payment buttons.
**Interactions:** Modal usage for Batch Selection (when multiple batches exist), Customer Selection (search/create), Payment Modal (Cash, UPI with QR simulation, Card, Split payments), and an overriding Prescription (Rx) warning modal.

## 18. Inventory
- **Overview**: Data tables for stock.
- **Status Badges**: Explicit tagging for "Expiring" (Amber badge with days left) vs "Expired" (Red badge).
- **Stock Visualization**: Clear indication of "Low Stock" and "Out of Stock" via colored badges and table row highlights.
- **Tabs**: Used for navigating sub-modules (Stock, Batches, Expiry, Movements) using `.tab-list` and `.tab-btn`.

## 19. Purchases & 20. Sales & 21. Customers & 22. Suppliers
- **Pattern**: Page Header with Title and "Add New" primary button -> FilterBar/Search input -> DataTable in a Card -> Pagination.
- **Detail Pages**: Utilize a combination of header summary cards and a detailed table of line items (e.g., `SaleDetailPage`, `CustomerDetailPage`).

## 23. Reports & 24. Settings
- **Reports**: KPI cards at the top, Recharts charts, and detailed data tables with Export capabilities.
- **Settings**: Categorized via left-aligned vertical tabs or distinct route pages (Shop Settings, Printer, Backup, Sync). Form-heavy layout with grouped inputs.

## 25. Responsive Behavior
- **Mobile (<1024px)**: 
  - Sidebar changes from fixed desktop to an off-canvas drawer (`fixed inset-y-0 -translate-x-full`). Toggled via a hamburger menu in the header. Background overlay appears (`bg-slate-900/50`).
  - DataTables usually wrap or enforce horizontal scroll on container (`overflow-x-auto`).
  - Grids collapse (`grid-cols-1` from `grid-cols-3` or `grid-cols-6`).
- **Desktop (>=1024px)**: Sidebar locks into place. Header hamburger disappears (or toggles mini-sidebar).

## 26. Component Inventory
- `AppShell`: Main structural wrapper.
- `Sidebar`: Navigation container.
- `Header`: Top bar with search and user actions.
- `Button`: Primary actionable element (variants: primary, secondary, outline, ghost, danger, success).
- `Card` / `CardHeader`: White structural boxes with shadow.
- `KPICard`: Specific card for dashboard metrics.
- `DataTable`: Tabular data display with branded headers.
- `StatusBadge`: Pill indicators for states.
- `Input` / `Select` / `FilterBar`: Form controls.
- `Modal`: Floating dialogs (BatchSelector, Customer, Payment).

## 27. Complete Route/Screen Inventory
| Route | Page Name | Purpose | Layout Type |
|-------|-----------|---------|-------------|
| `/login` | Login | Authentication | Centered Card |
| `/dashboard` | Dashboard | KPI Overview | Grid + Cards + Tables |
| `/pos` | POS Billing | Checkout | 3-Column Workspace |
| `/sales` | Sales | Invoice History | List + Table |
| `/sales/:id` | Sale Detail | Invoice View | Details + Line Items |
| `/returns` | Returns | Sales Returns | List + Table |
| `/products` | Products | Inventory Master | List + Table |
| `/products/new` | Product Form | Add/Edit Item | Form Layout |
| `/categories` | Categories | Taxonomy | List + Table |
| `/manufacturers` | Manufacturers | Supply Chain | List + Table |
| `/inventory` | Stock | Stock Levels | List + Table |
| `/inventory/batches` | Batches | Batch Tracking | List + Table |
| `/inventory/expiry` | Expiry | Expiry Tracking | List + Table |
| `/inventory/low-stock` | Low Stock | Replenishment | List + Table |
| `/inventory/movements` | Movements | Audit Trail | List + Table |
| `/purchases` | Purchase Orders | PO Management | List + Table |
| `/purchases/new` | New Purchase | Create PO | Form + Grid |
| `/purchases/receiving`| Receiving | Goods Receipt | List + Table |
| `/suppliers` | Suppliers | Vendor Master | List + Table |
| `/customers` | Customers | Client Master | List + Table |
| `/customers/:id` | Customer Detail | Client Ledger | Details + History |
| `/payments` | Payments | Ledger/Cash | List + Table |
| `/expenses` | Expenses | Cost Tracking | List + Table |
| `/staff` | Staff | User Management | List + Table |
| `/reports` | Reports | Analytics | Charts + Tables |
| `/settings/*` | Settings | Configuration | Form Layouts |

## 28. Reference Notes
- The usage of `Inter` font paired with flat `#f8fafc` backgrounds and tight border-radii gives a highly clinical, professional feel suitable for healthcare software.
- The POS layout is distinctly separated from the standard CRUD views, optimizing the workspace entirely to eliminate vertical scrolling during checkout.
- Micro-interactions (like the `-translate-y-px` on hover for KPI cards) add a premium feel without impacting performance.
