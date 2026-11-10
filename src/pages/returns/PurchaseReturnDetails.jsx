import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getPurchaseReturns } from '../../services/returnApi';
import { getPayments } from '../../services/paymentApi';
import { resolveDocumentBranding } from '../../utils/documentBranding';

const PurchaseReturnDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ret, setRet] = useState(null);
  const [refundPayment, setRefundPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [returnsRes, paymentsRes] = await Promise.all([
          getPurchaseReturns(),
          getPayments()
        ]);

        const allReturns = returnsRes.data || [];
        const found = allReturns.find(r => r.id === id || r.id === String(id));
        if (!found) {
          navigate('/purchases/returns');
          return;
        }
        setRet(found);

        // Find the associated refund payment by referenceId or reference field
        const allPayments = paymentsRes.data || [];
        const payment = allPayments.find(p =>
          p.referenceId === found.id ||
          p.referenceId === String(found.id) ||
          p.reference === found.id ||
          p.reference === `PR-${found.id}` ||
          p.reference === `PR-PR-${found.id.replace('PR-', '')}` // Catch legacy double prefix just in case
        );
        setRefundPayment(payment || null);
      } catch (err) {
        console.error('Failed to load purchase return details:', err);
        navigate('/purchases/returns');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <LoadingSpinner />;
  if (!ret) return null;

  const items = ret.items || [];
  const refundAmount = Number(ret.refundAmount) || Number(ret.amount) || 0;
  const docBranding = resolveDocumentBranding(ret);

  return (
    <div className="space-y-6 pb-12">
      {/* Printable Purchase Return Slip Header */}
      <div className="hidden print:flex items-center justify-between border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex items-center gap-4">
          {docBranding.displayLogo && (
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={docBranding.displayLogo}
                alt={`${docBranding.name} Logo`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold uppercase text-gray-900">{docBranding.name}</h1>
            {docBranding.fullAddress && (
              <p className="text-xs text-gray-600">{docBranding.fullAddress}</p>
            )}
            {docBranding.contactLine && (
              <p className="text-xs text-gray-600">{docBranding.contactLine}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase text-gray-800">Purchase Return Slip</h2>
          <p className="text-sm font-semibold">Return ID: {ret.id}</p>
          <p className="text-xs text-gray-500">Date: {ret.date ? new Date(ret.date).toLocaleDateString() : '-'}</p>
        </div>
      </div>

      {/* Back navigation & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/purchases/returns')} className="p-1.5 h-auto text-[#64748B] hover:text-[#162033] dark:hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="text-xs font-semibold">Back to Returns</span>
          </Button>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2482ED]/10 text-[#2482ED] dark:bg-[#2482ED]/20 dark:text-blue-400 border border-[#2482ED]/20">
            {ret.id}
          </span>
          <StatusBadge status={ret.status || 'Processed'} />
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="self-end sm:self-auto">
          <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Return Slip
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Return Information */}
        <div className="bg-white dark:bg-[#132B42] p-6 rounded-xl border border-[#DDE6F0] dark:border-[#263B50] shadow-sm">
          <h2 className="text-[15px] font-bold text-[#162033] dark:text-white mb-4">Return Information</h2>
          <div className="space-y-3 text-[13px]">
            <div className="flex justify-between">
              <span className="text-[#64748B] dark:text-slate-400">Return ID:</span>
              <span className="font-semibold text-[#2482ED] dark:text-blue-400">{ret.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B] dark:text-slate-400">Original Purchase / PO:</span>
              <span className="font-semibold text-[#162033] dark:text-white">
                {ret.purchaseId ? (
                  <Link to={`/purchases/${ret.purchaseId}`} className="text-[#2482ED] dark:text-blue-400 hover:underline">
                    {ret.purchaseOrderNumber || ret.purchaseId}
                  </Link>
                ) : (ret.purchaseOrderNumber || '-')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B] dark:text-slate-400">Supplier:</span>
              <span className="font-semibold text-[#162033] dark:text-white">
                {ret.supplierId ? (
                  <Link to={`/suppliers/${ret.supplierId}`} className="text-[#2482ED] dark:text-blue-400 hover:underline">
                    {ret.supplierName || 'Supplier'}
                  </Link>
                ) : (ret.supplierName || 'Supplier')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B] dark:text-slate-400">Return Date:</span>
              <span className="font-semibold text-[#162033] dark:text-white">
                {ret.date ? new Date(ret.date).toLocaleString() : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B] dark:text-slate-400">Status:</span>
              <StatusBadge status={ret.status || 'Processed'} />
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B] dark:text-slate-400">Return Amount:</span>
              <span className="font-bold text-[#162033] dark:text-white">₹{refundAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B] dark:text-slate-400">Return Reason:</span>
              <span className="font-semibold text-[#162033] dark:text-white">{ret.reason || ret.globalReason || '-'}</span>
            </div>
          </div>
        </div>

        {/* Refund / Payment Information */}
        <div className="bg-white dark:bg-[#132B42] p-6 rounded-xl border border-[#DDE6F0] dark:border-[#263B50] shadow-sm">
          <h2 className="text-[15px] font-bold text-[#162033] dark:text-white mb-4">Refund / Payment</h2>
          {refundPayment ? (
            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-slate-400">Payment ID:</span>
                <span className="font-semibold text-[#2482ED] dark:text-blue-400">#{refundPayment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-slate-400">Reference:</span>
                <span className="font-semibold text-[#162033] dark:text-white">
                  {refundPayment.reference 
                    ? refundPayment.reference.replace(/^PR-PR-/, 'PR-')
                    : refundPayment.referenceId || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-slate-400">Amount:</span>
                <span className="font-bold text-[#162033] dark:text-white">₹{Number(refundPayment.amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-slate-400">Method:</span>
                <span className="font-semibold text-[#162033] dark:text-white">{refundPayment.paymentMethod || refundPayment.method || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-slate-400">Status:</span>
                <StatusBadge status={refundPayment.status || 'Completed'} />
              </div>
              {refundPayment.date && (
                <div className="flex justify-between">
                  <span className="text-[#64748B] dark:text-slate-400">Date:</span>
                  <span className="font-semibold text-[#162033] dark:text-white">{new Date(refundPayment.date).toLocaleString()}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[13px] text-[#64748B]">No refund payment record linked.</p>
          )}
        </div>
      </div>

      {/* Returned Items */}
      <div className="bg-white dark:bg-[#132B42] rounded-xl border border-[#DDE6F0] dark:border-[#263B50] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DDE6F0] dark:border-[#263B50]">
          <h2 className="text-[15px] font-bold text-[#162033] dark:text-white">Returned Items</h2>
        </div>
        {items.length === 0 ? (
          <p className="px-6 py-4 text-[13px] text-[#64748B]">No item details stored.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#DDE6F0] dark:divide-[#263B50]">
              <thead className="bg-[#24C9A0] dark:bg-[#1A9F7E] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Medicine Name</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Batch Number</th>
                  <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Qty Returned</th>
                  <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Purchase Price</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Return Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#132B42] divide-y divide-[#DDE6F0] dark:divide-[#263B50]">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#F5F8FC] dark:hover:bg-[#0B1A2A]">
                    <td className="px-6 py-3 text-[13px] font-semibold text-[#162033] dark:text-white">{item.medicineName || item.name || '-'}</td>
                    <td className="px-6 py-3 text-[13px] text-[#64748B] dark:text-slate-400">{item.batchNumber || item.batch || '-'}</td>
                    <td className="px-6 py-3 text-[13px] text-right text-[#162033] dark:text-white font-semibold">{item.quantity ?? item.returnQty ?? '-'}</td>
                    <td className="px-6 py-3 text-[13px] text-right text-[#162033] dark:text-white">
                      {item.purchasePrice != null ? `₹${Number(item.purchasePrice).toFixed(2)}` : (item.rate != null ? `₹${Number(item.rate).toFixed(2)}` : '-')}
                    </td>
                    <td className="px-6 py-3 text-[13px] text-[#64748B] dark:text-slate-400">{item.reason || ret.reason || '-'}</td>
                    <td className="px-6 py-3 text-[13px] text-right text-[#162033] dark:text-white font-bold">
                      {item.purchasePrice != null && (item.quantity ?? item.returnQty) != null 
                        ? `₹${(Number(item.purchasePrice) * Number(item.quantity ?? item.returnQty)).toFixed(2)}`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#F5F8FC] dark:bg-[#0B1A2A]">
                <tr>
                  <td colSpan={5} className="px-6 py-3 text-[13px] font-semibold text-[#162033] dark:text-white text-right">
                    Total Amount:
                  </td>
                  <td className="px-6 py-3 text-[13px] font-bold text-[#162033] dark:text-white text-right">
                    ₹{refundAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseReturnDetails;
