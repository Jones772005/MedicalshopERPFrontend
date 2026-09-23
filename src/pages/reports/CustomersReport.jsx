import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReportFilterBar from '../../components/reports/ReportFilterBar';
import StatCard from '../../components/common/StatCard';
import { getCustomers } from '../../services/customerApi';
import { getSales } from '../../services/salesApi';

const CustomersReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerReport = async () => {
      // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
      try {
        const [cRes, sRes] = await Promise.all([getCustomers(), getSales()]);
        
        // Mock enrichment
        const enriched = cRes.data.map(customer => {
          const customerSales = sRes.data.filter(s => s.customerId === customer.id);
          const bills = customerSales.length;
          const totalPurchases = customerSales.reduce((acc, curr) => acc + curr.grandTotal, 0);
          const avgBill = bills > 0 ? totalPurchases / bills : 0;
          const outstanding = 0; // Assuming all paid for mock
          const lastPurchase = customerSales.length > 0 
            ? Math.max(...customerSales.map(s => new Date(s.date).getTime()))
            : null;

          return {
            ...customer,
            bills,
            totalPurchases,
            avgBill,
            outstanding,
            lastPurchase: lastPurchase ? new Date(lastPurchase).toLocaleDateString() : 'Never'
          };
        });
        
        setData(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerReport();
  }, []);

  const columns = [
    { header: 'Customer', accessor: 'name', cell: (row) => <span className="font-bold text-[#162033] dark:text-white">{row.name}</span> },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Bills', accessor: 'bills' },
    { header: 'Total Purchases', accessor: 'totalPurchases', cell: (row) => `₹${row.totalPurchases.toFixed(2)}` },
    { header: 'Avg Bill', accessor: 'avgBill', cell: (row) => `₹${row.avgBill.toFixed(2)}` },
    { header: 'Outstanding', accessor: 'outstanding', cell: (row) => (
      <span className={row.outstanding > 0 ? 'text-red-600 dark:text-red-400 font-medium' : 'text-green-600 dark:text-green-400'}>
        ₹{row.outstanding.toFixed(2)}
      </span>
    ) },
    { header: 'Last Purchase', accessor: 'lastPurchase' }
  ];

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader title="Customers Report" description="Customer activity and purchasing metrics." />
      
      <ReportFilterBar 
        showDateRange={false}
        onFilter={() => {}} 
        onExport={() => alert('Exporting (Mock)')}
        onPrint={() => window.print()}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Customers"
          value={data.length.toString()}
          color="primary"
        />
        <StatCard
          title="Total Revenue (All Customers)"
          value={`₹${data.reduce((acc, curr) => acc + curr.totalPurchases, 0).toFixed(2)}`}
          color="success"
        />
        <StatCard
          title="Total Outstanding"
          value={`₹${data.reduce((acc, curr) => acc + curr.outstanding, 0).toFixed(2)}`}
          color="warning"
        />
      </div>

      <div className="bg-white dark:bg-[#132B42] rounded-xl shadow-sm border border-[#DDE6F0] dark:border-[#263B50] overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={data} searchPlaceholder="Search customers..." />
        )}
      </div>
    </div>
  );
};

export default CustomersReport;
