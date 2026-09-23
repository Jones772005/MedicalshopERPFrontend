import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReportFilterBar from '../../components/reports/ReportFilterBar';
import StatCard from '../../components/common/StatCard';

import { getSales } from '../../services/salesApi';
import { getPurchases } from '../../services/purchaseApi';
import { getSalesReturns, getPurchaseReturns } from '../../services/returnApi';
import { calculateTaxes } from '../../utils/financialCalculations';

const TaxReport = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allRaw, setAllRaw] = useState({ sales: [], purchases: [], sReturns: [], pReturns: [] });

  const computeTax = (sales, purchases, sReturns, pReturns, filters = {}) => {
    const { startDate, endDate } = filters;
    const filterDate = (items, dateField) => {
      let r = items;
      if (startDate) r = r.filter(i => (i[dateField] || i.createdAt) >= startDate);
      if (endDate) r = r.filter(i => (i[dateField] || i.createdAt) <= endDate + 'T23:59:59');
      return r;
    };
    const fSales = filterDate(sales, 'date');
    const fPurchases = filterDate(purchases, 'orderDate');
    const fSR = filterDate(sReturns, 'date');
    const fPR = filterDate(pReturns, 'date');

    const taxSummary = calculateTaxes(fSales, fPurchases, fSR, fPR);
    setSummary(taxSummary);

    const combined = [
      ...fSales.map(s => ({
        id: s.id, date: s.date || s.createdAt, type: 'Sale',
        reference: s.invoiceNumber || `INV-${s.id}`,
        taxableAmount: (s.subtotal || 0) - (s.discount || 0),
        gstAmount: s.tax || 0,
        total: s.grandTotal || 0
      })),
      ...fPurchases.map(p => ({
        id: p.id, date: p.orderDate || p.createdAt, type: 'Purchase',
        reference: p.purchaseOrderNumber || `PO-${p.id}`,
        taxableAmount: (p.totalAmount || 0) - (p.tax || 0),
        gstAmount: p.items?.reduce((acc, i) => acc + ((i.quantity * i.purchasePrice * (1 - (i.discount||0)/100)) * ((i.gst||0)/100)), 0) || 0,
        total: p.totalAmount || 0
      }))
    ];
    combined.sort((a, b) => new Date(b.date) - new Date(a.date));
    setData(combined);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, purchasesRes, srRes, prRes] = await Promise.all([
          getSales(), getPurchases(), getSalesReturns(), getPurchaseReturns()
        ]);
        const sales = salesRes.data || [];
        const purchases = purchasesRes.data || [];
        const sReturns = srRes.data || [];
        const pReturns = prRes.data || [];
        setAllRaw({ sales, purchases, sReturns, pReturns });
        computeTax(sales, purchases, sReturns, pReturns, {});
      } catch (err) {
        console.error('Failed to load tax data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (filters) => {
    const { sales, purchases, sReturns, pReturns } = allRaw;
    computeTax(sales, purchases, sReturns, pReturns, filters);
  };

  const columns = [
    { header: 'Date', accessor: 'date', cell: (row) => new Date(row.date).toLocaleDateString() },
    { header: 'Type', accessor: 'type', cell: (row) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        row.type === 'Sale' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
      }`}>
        {row.type}
      </span>
    )},
    { header: 'Reference', accessor: 'reference', cell: (row) => <span className="font-medium text-primary-600 dark:text-primary-400">{row.reference}</span> },
    { header: 'Taxable Amount', accessor: 'taxableAmount', cell: (row) => `₹${row.taxableAmount.toFixed(2)}` },
    { header: 'GST Amount', accessor: 'gstAmount', cell: (row) => <span className="text-orange-600 dark:text-orange-400 font-medium">₹{row.gstAmount.toFixed(2)}</span> },
    { header: 'Total', accessor: 'total', cell: (row) => <span className="font-bold text-[#162033] dark:text-white">₹{row.total.toFixed(2)}</span> }
  ];

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader title="Tax Report" description="GST collected and tax breakdowns." />
      
      <ReportFilterBar 
        onFilter={handleFilter}
        onExport={() => alert('Exporting')}
        onPrint={() => window.print()}
      />

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Net Output Tax (Sales GST)"
            value={`₹${summary.netOutputTax.toFixed(2)}`}
            color="primary"
          />
          <StatCard
            title="Net Input Tax (Purchase GST)"
            value={`₹${summary.netInputTax.toFixed(2)}`}
            color="info"
          />
          <StatCard
            title={summary.netTaxPayable >= 0 ? 'Net Tax Payable' : 'Input Tax Credit (ITC)'}
            value={`₹${Math.abs(summary.netTaxPayable).toFixed(2)}`}
            color={summary.netTaxPayable >= 0 ? 'warning' : 'success'}
          />
        </div>
      )}

      <div className="bg-white dark:bg-[#132B42] rounded-xl shadow-sm border border-[#DDE6F0] dark:border-[#263B50] overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={data} searchPlaceholder="Search tax records..." />
        )}
      </div>
    </div>
  );
};

export default TaxReport;
