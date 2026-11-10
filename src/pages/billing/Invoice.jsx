import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import InvoicePreview from '../../components/billing/InvoicePreview';
import { getSaleById } from '../../services/salesApi';
import { getMedicines } from '../../services/medicineApi';

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [saleRes, medRes] = await Promise.all([
          getSaleById(id),
          getMedicines()
        ]);
        setSale(saleRes.data);
        setMedicines(medRes.data);
      } catch (err) {
        console.error('Failed to load invoice:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!sale) return <div className="p-8 text-center text-gray-500">Invoice not found.</div>;

  return (
    <div className="space-y-6 w-full pb-12">
      {/* ── ERP PAGE TOOLBAR (FULL AVAILABLE WIDTH) ─────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/sales')} className="p-1.5 h-auto text-[#64748B] hover:text-[#162033] dark:hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="text-xs font-semibold">Back to Sales</span>
          </Button>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2482ED]/10 text-[#2482ED] dark:bg-[#2482ED]/20 dark:text-blue-400 border border-[#2482ED]/20">
            {sale.invoiceNumber || `INV-${sale.id}`}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {sale.paymentMethod || 'Paid'}
          </span>
        </div>
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <Button size="sm" onClick={() => navigate('/billing')}>
            New Bill
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Invoice
          </Button>
        </div>
      </div>

      {/* ── INVOICE PREVIEW WORKSPACE (DESK CANVAS) ─────────────── */}
      <div className="w-full bg-[#EBF0F7] dark:bg-slate-900/80 rounded-xl p-4 sm:p-8 lg:p-12 border border-[#DDE6F0] dark:border-slate-800 flex justify-center items-center overflow-x-auto print:p-0 print:border-none print:bg-transparent print:m-0">
        <InvoicePreview sale={sale} medicines={medicines} />
      </div>
    </div>
  );
};

export default Invoice;
