import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReportFilterBar from '../../components/reports/ReportFilterBar';
import StatCard from '../../components/common/StatCard';
import { getSuppliers } from '../../services/supplierApi';
import { getPurchases } from '../../services/purchaseApi';
import { getPayments } from '../../services/paymentApi';

const SuppliersReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupplierReport = async () => {
      // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
      try {
        const [supRes, purRes, payRes] = await Promise.all([
          getSuppliers(), 
          getPurchases(),
          getPayments()
        ]);
        
        const enriched = supRes.data.map(supplier => {
          const supplierPurchases = purRes.data.filter(p => String(p.supplierId) === String(supplier.id));
          const purchaseCount = supplierPurchases.length;
          
          const purchaseValue = supplierPurchases.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
          
          const purchaseIds = supplierPurchases.map(p => String(p.id));
          const supplierPayments = payRes.data.filter(pay => 
            pay.type === 'Purchase' && purchaseIds.includes(String(pay.referenceId))
          );
          
          const paid = supplierPayments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
          const outstanding = Math.max(0, purchaseValue - paid);

          const lastPurchase = supplierPurchases.length > 0 
            ? Math.max(...supplierPurchases.map(s => new Date(s.orderDate || s.createdAt).getTime()))
            : null;

          return {
            ...supplier,
            purchaseCount,
            purchaseValue,
            paid,
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
    fetchSupplierReport();
  }, []);

  const columns = [
    { header: 'Supplier', accessor: 'supplierName', cell: (row) => <span className="font-bold text-[#162033] dark:text-white">{row.supplierName || row.name}</span> },
    { header: 'Contact', accessor: 'contactPerson', cell: (row) => row.contactPerson || row.contact || '-' },
    { header: 'Orders', accessor: 'purchaseCount' },
    { header: 'Total Value', accessor: 'purchaseValue', cell: (row) => `₹${row.purchaseValue.toFixed(2)}` },
    { header: 'Paid', accessor: 'paid', cell: (row) => <span className="text-green-600 dark:text-green-400 font-medium">₹{row.paid.toFixed(2)}</span> },
    { header: 'Outstanding', accessor: 'outstanding', cell: (row) => (
      <span className={row.outstanding > 0 ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-500'}>
        ₹{row.outstanding.toFixed(2)}
      </span>
    ) },
    { header: 'Last Order', accessor: 'lastPurchase' }
  ];

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader title="Suppliers Report" description="Supplier procurement and payment metrics." />
      
      <ReportFilterBar 
        showDateRange={false}
        onFilter={() => {}} 
        onExport={() => alert('Exporting (Mock)')}
        onPrint={() => window.print()}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Suppliers"
          value={data.length.toString()}
          color="info"
        />
        <StatCard
          title="Total Purchase Value"
          value={`₹${data.reduce((acc, curr) => acc + curr.purchaseValue, 0).toFixed(2)}`}
          color="primary"
        />
        <StatCard
          title="Total Paid"
          value={`₹${data.reduce((acc, curr) => acc + curr.paid, 0).toFixed(2)}`}
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
          <DataTable columns={columns} data={data} searchPlaceholder="Search suppliers..." />
        )}
      </div>
    </div>
  );
};

export default SuppliersReport;
