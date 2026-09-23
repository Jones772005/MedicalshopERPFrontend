import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PermissionGuard } from '../utils/permissions';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/auth/Login';
import AccessDenied from '../pages/auth/AccessDenied';
import Dashboard from '../pages/dashboard/Dashboard';
import MedicineList from '../pages/medicines/MedicineList';
import MedicineForm from '../pages/medicines/MedicineForm';
import MedicineDetails from '../pages/medicines/MedicineDetails';
import InventoryList from '../pages/inventory/InventoryList';
import LowStockList from '../pages/inventory/LowStockList';
import OutOfStockList from '../pages/inventory/OutOfStockList';
import ExpiryManagement from '../pages/inventory/ExpiryManagement';
import FefoView from '../pages/inventory/FefoView';
import StockTransactions from '../pages/inventory/StockTransactions';
import ReorderRecommendations from '../pages/inventory/ReorderRecommendations';
import CustomerList from '../pages/customers/CustomerList';
import CustomerForm from '../pages/customers/CustomerForm';
import CustomerDetails from '../pages/customers/CustomerDetails';
import SupplierList from '../pages/suppliers/SupplierList';
import SupplierForm from '../pages/suppliers/SupplierForm';
import SupplierDetails from '../pages/suppliers/SupplierDetails';

// Phase 3 Imports
import PurchaseList from '../pages/purchases/PurchaseList';
import CreatePurchase from '../pages/purchases/CreatePurchase';
import PurchaseDetails from '../pages/purchases/PurchaseDetails';
import GoodsReceiving from '../pages/purchases/GoodsReceiving';
import POS from '../pages/billing/POS';
import SalesHistory from '../pages/billing/SalesHistory';
import Invoice from '../pages/billing/Invoice';
import PaymentList from '../pages/payments/PaymentList';
import SalesReturns from '../pages/returns/SalesReturns';
import SalesReturnDetails from '../pages/returns/SalesReturnDetails';
import PurchaseReturns from '../pages/returns/PurchaseReturns';
import PurchaseReturnDetails from '../pages/returns/PurchaseReturnDetails';

// Phase 7.28 Imports (Discounts)
import DiscountList from '../pages/discounts/DiscountList';
import DiscountForm from '../pages/discounts/DiscountForm';
import DiscountDetails from '../pages/discounts/DiscountDetails';

// Phase 4 Imports
// Phase 4 Imports
import Notifications from '../pages/notifications/Notifications';
import AlternativeMedicines from '../pages/medicines/AlternativeMedicines';

import ReportsDashboard from '../pages/reports/ReportsDashboard';
import SalesReport from '../pages/reports/SalesReport';
import PurchasesReport from '../pages/reports/PurchasesReport';
import InventoryReport from '../pages/reports/InventoryReport';
import FinancialReport from '../pages/reports/FinancialReport';
import TaxReport from '../pages/reports/TaxReport';
import CustomersReport from '../pages/reports/CustomersReport';
import SuppliersReport from '../pages/reports/SuppliersReport';

import BusinessIntelligence from '../pages/analytics/BusinessIntelligence';
import StockPrediction from '../pages/analytics/StockPrediction';

import CampaignList from '../pages/marketing/CampaignList';
import CreateCampaign from '../pages/marketing/CreateCampaign';
import QRManagement from '../pages/marketing/QRManagement';
import MarketingAnalytics from '../pages/marketing/MarketingAnalytics';

// Phase 5 Imports - Staff & Roles
import StaffList from '../pages/staff/StaffList';
import CreateStaff from '../pages/staff/CreateStaff';
import StaffDetails from '../pages/staff/StaffDetails';
import EditStaff from '../pages/staff/EditStaff';
import RolesList from '../pages/roles/RolesList';
import RoleDetails from '../pages/roles/RoleDetails';
import EditRole from '../pages/roles/EditRole';

// Phase 5 Imports - Security & Profile
import AuditLogs from '../pages/security/AuditLogs';
import Sessions from '../pages/security/Sessions';
import Profile from '../pages/profile/Profile';

// Phase 5 Imports - Settings
import SettingsLayout from '../pages/settings/SettingsLayout';
import PharmacySettings from '../pages/settings/PharmacySettings';
import InvoiceSettings from '../pages/settings/InvoiceSettings';
import TaxSettings from '../pages/settings/TaxSettings';
import NotificationSettings from '../pages/settings/NotificationSettings';
import PrinterSettings from '../pages/settings/PrinterSettings';
import BarcodeSettings from '../pages/settings/BarcodeSettings';
import QRSettings from '../pages/settings/QRSettings';
import SecuritySettings from '../pages/settings/SecuritySettings';
import BackupSettings from '../pages/settings/BackupSettings';
import SystemAdministration from '../pages/settings/SystemAdministration';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const RoleRoute = ({ permission, permissions, requireAll, children }) => {
  return (
    <PermissionGuard 
      permission={permission} 
      permissions={permissions} 
      requireAll={requireAll} 
      fallback={<AccessDenied requiredPermission={permission} />}
    >
      {children}
    </PermissionGuard>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/access-denied" element={<AccessDenied />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Medicines */}
        <Route path="medicines" element={<RoleRoute permission="medicines.view"><MedicineList /></RoleRoute>} />
        <Route path="medicines/add" element={<RoleRoute permission="medicines.create"><MedicineForm /></RoleRoute>} />
        <Route path="medicines/alternatives" element={<RoleRoute permission="medicines.view"><AlternativeMedicines /></RoleRoute>} />
        <Route path="medicines/:id" element={<RoleRoute permission="medicines.view"><MedicineDetails /></RoleRoute>} />
        <Route path="medicines/:id/edit" element={<RoleRoute permission="medicines.edit"><MedicineForm /></RoleRoute>} />
        
        {/* Inventory */}
        <Route path="inventory" element={<RoleRoute permission="inventory.view"><InventoryList /></RoleRoute>} />
        <Route path="inventory/low-stock" element={<RoleRoute permission="inventory.view"><LowStockList /></RoleRoute>} />
        <Route path="inventory/out-of-stock" element={<RoleRoute permission="inventory.view"><OutOfStockList /></RoleRoute>} />
        <Route path="inventory/expiry" element={<RoleRoute permission="inventory.expiry"><ExpiryManagement /></RoleRoute>} />
        <Route path="inventory/fefo" element={<RoleRoute permission="inventory.view"><FefoView /></RoleRoute>} />
        <Route path="inventory/transactions" element={<RoleRoute permission="inventory.transactions"><StockTransactions /></RoleRoute>} />
        <Route path="inventory/reorder" element={<RoleRoute permission="inventory.reorder"><ReorderRecommendations /></RoleRoute>} />
        
        {/* Customers */}
        <Route path="customers" element={<RoleRoute permission="customers.view"><CustomerList /></RoleRoute>} />
        <Route path="customers/add" element={<RoleRoute permission="customers.create"><CustomerForm /></RoleRoute>} />
        <Route path="customers/:id" element={<RoleRoute permission="customers.view"><CustomerDetails /></RoleRoute>} />
        <Route path="customers/:id/edit" element={<RoleRoute permission="customers.edit"><CustomerForm /></RoleRoute>} />
        
        {/* Suppliers */}
        <Route path="suppliers" element={<RoleRoute permission="suppliers.view"><SupplierList /></RoleRoute>} />
        <Route path="suppliers/add" element={<RoleRoute permission="suppliers.create"><SupplierForm /></RoleRoute>} />
        <Route path="suppliers/:id" element={<RoleRoute permission="suppliers.view"><SupplierDetails /></RoleRoute>} />
        <Route path="suppliers/:id/edit" element={<RoleRoute permission="suppliers.edit"><SupplierForm /></RoleRoute>} />
        
        {/* Purchases */}
        <Route path="purchases" element={<RoleRoute permission="purchases.view"><PurchaseList /></RoleRoute>} />
        <Route path="purchases/new" element={<RoleRoute permission="purchases.create"><CreatePurchase /></RoleRoute>} />
        <Route path="purchases/:id" element={<RoleRoute permission="purchases.view"><PurchaseDetails /></RoleRoute>} />
        <Route path="purchases/:id/receive" element={<RoleRoute permission="purchases.receive"><GoodsReceiving /></RoleRoute>} />
        <Route path="purchases/returns" element={<RoleRoute permission="returns.process"><PurchaseReturns /></RoleRoute>} />
        <Route path="purchases/returns/:id" element={<RoleRoute permission="returns.process"><PurchaseReturnDetails /></RoleRoute>} />
        
        {/* Billing & Sales */}
        <Route path="billing" element={<RoleRoute permission="billing.create"><POS /></RoleRoute>} />
        <Route path="billing/history" element={<RoleRoute permission="billing.print"><SalesHistory /></RoleRoute>} />
        <Route path="billing/invoice/:id" element={<RoleRoute permission="billing.print"><Invoice /></RoleRoute>} />
        <Route path="sales" element={<Navigate to="/billing/history" replace />} />
        <Route path="sales/returns" element={<RoleRoute permission="returns.process"><SalesReturns /></RoleRoute>} />
        <Route path="sales/returns/new" element={<RoleRoute permission="returns.process"><SalesReturns /></RoleRoute>} />
        <Route path="sales/returns/:id" element={<RoleRoute permission="returns.process"><SalesReturnDetails /></RoleRoute>} />
        
        {/* Discounts */}
        <Route path="discounts" element={<RoleRoute permission="discounts.view"><DiscountList /></RoleRoute>} />
        <Route path="discounts/new" element={<RoleRoute permission="discounts.manage"><DiscountForm /></RoleRoute>} />
        <Route path="discounts/:id" element={<RoleRoute permission="discounts.view"><DiscountDetails /></RoleRoute>} />
        <Route path="discounts/:id/edit" element={<RoleRoute permission="discounts.manage"><DiscountForm /></RoleRoute>} />
        
        {/* Payments */}
        <Route path="payments" element={<RoleRoute permission="billing.payment"><PaymentList /></RoleRoute>} />
        <Route path="payments/new" element={<RoleRoute permission="billing.payment"><PaymentList /></RoleRoute>} />
        


        {/* Reports */}
        <Route path="reports" element={<RoleRoute permissions={['reports.sales', 'reports.purchases', 'reports.inventory']}><ReportsDashboard /></RoleRoute>} />
        <Route path="reports/sales" element={<RoleRoute permission="reports.sales"><SalesReport /></RoleRoute>} />
        <Route path="reports/purchases" element={<RoleRoute permission="reports.purchases"><PurchasesReport /></RoleRoute>} />
        <Route path="reports/inventory" element={<RoleRoute permission="reports.inventory"><InventoryReport /></RoleRoute>} />
        <Route path="reports/financial" element={<RoleRoute permission="reports.financial"><FinancialReport /></RoleRoute>} />
        <Route path="reports/tax" element={<RoleRoute permission="reports.tax"><TaxReport /></RoleRoute>} />
        <Route path="reports/customers" element={<RoleRoute permission="customers.view"><CustomersReport /></RoleRoute>} />
        <Route path="reports/suppliers" element={<RoleRoute permission="suppliers.view"><SuppliersReport /></RoleRoute>} />

        {/* Analytics & BI */}
        <Route path="analytics/bi" element={<RoleRoute permission="dashboard.analytics"><BusinessIntelligence /></RoleRoute>} />
        <Route path="analytics/predictions" element={<RoleRoute permission="dashboard.analytics"><StockPrediction /></RoleRoute>} />

        {/* Marketing */}
        <Route path="marketing/campaigns" element={<RoleRoute permission="marketing.campaigns"><CampaignList /></RoleRoute>} />
        <Route path="marketing/campaigns/new" element={<RoleRoute permission="marketing.create_campaign"><CreateCampaign /></RoleRoute>} />
        <Route path="marketing/qr" element={<RoleRoute permission="marketing.qr"><QRManagement /></RoleRoute>} />
        <Route path="marketing/analytics" element={<RoleRoute permission="marketing.analytics"><MarketingAnalytics /></RoleRoute>} />

        {/* Global Notifications */}
        <Route path="notifications" element={<Notifications />} />

        {/* Phase 5 - Staff */}
        <Route path="staff" element={<RoleRoute permission="staff.view"><StaffList /></RoleRoute>} />
        <Route path="staff/add" element={<RoleRoute permission="staff.create"><CreateStaff /></RoleRoute>} />
        <Route path="staff/:id" element={<RoleRoute permission="staff.view"><StaffDetails /></RoleRoute>} />
        <Route path="staff/:id/edit" element={<RoleRoute permission="staff.edit"><EditStaff /></RoleRoute>} />
        
        {/* Phase 5 - Roles */}
        <Route path="roles" element={<RoleRoute permission="staff.roles"><RolesList /></RoleRoute>} />
        <Route path="roles/:id" element={<RoleRoute permission="staff.roles"><RoleDetails /></RoleRoute>} />
        <Route path="roles/:id/edit" element={<RoleRoute permission="staff.roles"><EditRole /></RoleRoute>} />

        {/* Phase 5 - Security & Audit */}
        <Route path="audit-logs" element={<RoleRoute permission="security.audit"><AuditLogs /></RoleRoute>} />
        <Route path="sessions" element={<RoleRoute permission="security.sessions"><Sessions /></RoleRoute>} />
        <Route path="profile" element={<Profile />} />

        {/* Phase 5 - Settings */}
        <Route path="settings" element={<RoleRoute permission="settings.view"><SettingsLayout /></RoleRoute>}>
          <Route index element={<Navigate to="/settings/pharmacy" replace />} />
          <Route path="pharmacy" element={<RoleRoute permission="settings.view"><PharmacySettings /></RoleRoute>} />
          <Route path="invoice" element={<RoleRoute permission="settings.invoice"><InvoiceSettings /></RoleRoute>} />
          <Route path="tax" element={<RoleRoute permission="settings.tax"><TaxSettings /></RoleRoute>} />
          <Route path="notifications" element={<RoleRoute permission="settings.view"><NotificationSettings /></RoleRoute>} />
          <Route path="printer" element={<RoleRoute permission="settings.printer"><PrinterSettings /></RoleRoute>} />
          <Route path="barcode" element={<RoleRoute permission="settings.view"><BarcodeSettings /></RoleRoute>} />
          <Route path="qr" element={<RoleRoute permission="settings.view"><QRSettings /></RoleRoute>} />
          <Route path="security" element={<RoleRoute permission="security.settings"><SecuritySettings /></RoleRoute>} />
          <Route path="backup" element={<RoleRoute permission="settings.backup"><BackupSettings /></RoleRoute>} />
          <Route path="system" element={<RoleRoute permission="settings.view"><SystemAdministration /></RoleRoute>} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
