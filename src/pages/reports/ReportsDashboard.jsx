import { useNavigate } from 'react-router-dom';
import { FileText, ShoppingCart, PackageOpen, PieChart, Landmark, Users, Truck } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

const reportModules = [
  { id: 'sales', title: 'Sales Report', icon: <ShoppingCart className="w-6 h-6" />, desc: 'Detailed view of sales, invoices, and revenue.' },
  { id: 'purchases', title: 'Purchases Report', icon: <PackageOpen className="w-6 h-6" />, desc: 'Procurement metrics, POs, and supplier history.' },
  { id: 'inventory', title: 'Inventory Report', icon: <FileText className="w-6 h-6" />, desc: 'Stock valuation, low stock, and expiry logs.' },
  { id: 'financial', title: 'Financial Report', icon: <PieChart className="w-6 h-6" />, desc: 'Profit margins, revenue vs expenses.' },
  { id: 'tax', title: 'Tax Report', icon: <Landmark className="w-6 h-6" />, desc: 'GST collected, tax breakdowns by category.' },
  { id: 'customers', title: 'Customers Report', icon: <Users className="w-6 h-6" />, desc: 'Customer retention, average bill values.' },
  { id: 'suppliers', title: 'Suppliers Report', icon: <Truck className="w-6 h-6" />, desc: 'Supplier performance and outstanding balances.' }
];

const ReportsDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader 
        title="Reports Dashboard" 
        description="Access comprehensive reports for all modules."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportModules.map(module => (
          <div 
            key={module.id}
            onClick={() => navigate(`/reports/${module.id}`)}
            className="bg-white dark:bg-[#132B42] p-6 rounded-xl border border-[#DDE6F0] dark:border-[#263B50] shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-[#2482ED] dark:hover:border-[#2482ED] group"
          >
            <div className="w-12 h-12 bg-[#F5F8FC] dark:bg-[#0B1A2A] text-[#2482ED] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {module.icon}
            </div>
            <h3 className="text-lg font-bold text-[#162033] dark:text-white mb-2">{module.title}</h3>
            <p className="text-[13px] text-[#64748B] dark:text-slate-400">{module.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsDashboard;
