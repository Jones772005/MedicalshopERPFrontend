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
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/sales')} className="p-2">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Sales
        </Button>
        <div className="space-x-3">
          <Button onClick={() => navigate('/billing')}>
            New Bill
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print Invoice
          </Button>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-slate-900 p-4 md:p-8 rounded-lg overflow-x-auto">
        <InvoicePreview sale={sale} medicines={medicines} />
      </div>
    </div>
  );
};

export default Invoice;
