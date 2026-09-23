import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReportFilterBar from '../../components/reports/ReportFilterBar';
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
    { header: 'Customer', accessor: 'name', cell: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.name}</span> },
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
    <div className="space-y-6">
      <PageHeader title="Customers Report" description="Customer activity and purchasing metrics." />
      
      <ReportFilterBar 
        showDateRange={false}
        onFilter={() => {}} 
        onExport={() => alert('Exporting (Mock)')}
        onPrint={() => window.print()}
      />

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={data} searchPlaceholder="Search customers..." />
        )}
      </div>
    </div>
  );
};

export default CustomersReport;
