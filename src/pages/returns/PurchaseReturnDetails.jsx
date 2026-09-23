import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getPurchaseReturns } from '../../services/returnApi';
import { getPayments } from '../../services/paymentApi';

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

  return (
    <div className="space-y-6 pb-12">
      {/* Back navigation */}
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="ghost" onClick={() => navigate('/purchases/returns')} className="p-2">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Purchase Return: {ret.id}
        </h1>
        <StatusBadge status={ret.status || 'Processed'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Return Information */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Return Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Return ID:</span>
              <span className="font-medium text-primary-600 dark:text-primary-400">{ret.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Original Purchase / PO:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {ret.purchaseId ? (
                  <Link to={`/purchases/${ret.purchaseId}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                    {ret.purchaseOrderNumber || ret.purchaseId}
                  </Link>
                ) : (ret.purchaseOrderNumber || '-')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Supplier:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {ret.supplierId ? (
                  <Link to={`/suppliers/${ret.supplierId}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                    {ret.supplierName || 'Supplier'}
                  </Link>
                ) : (ret.supplierName || 'Supplier')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Return Date:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {ret.date ? new Date(ret.date).toLocaleString() : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Status:</span>
              <StatusBadge status={ret.status || 'Processed'} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Return Amount:</span>
              <span className="font-bold text-gray-900 dark:text-white">₹{refundAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Return Reason:</span>
              <span className="font-medium text-gray-900 dark:text-white">{ret.reason || ret.globalReason || '-'}</span>
            </div>
          </div>
        </div>

        {/* Refund / Payment Information */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Refund / Payment</h2>
          {refundPayment ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Payment ID:</span>
                <span className="font-medium text-primary-600 dark:text-primary-400">#{refundPayment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Reference:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {refundPayment.reference 
                    ? refundPayment.reference.replace(/^PR-PR-/, 'PR-')
                    : refundPayment.referenceId || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Amount:</span>
                <span className="font-bold text-gray-900 dark:text-white">₹{Number(refundPayment.amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Method:</span>
                <span className="font-medium text-gray-900 dark:text-white">{refundPayment.paymentMethod || refundPayment.method || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Status:</span>
                <StatusBadge status={refundPayment.status || 'Completed'} />
              </div>
              {refundPayment.date && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">Date:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{new Date(refundPayment.date).toLocaleString()}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-slate-500">No refund payment record linked.</p>
          )}
        </div>
      </div>

      {/* Returned Items */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Returned Items</h2>
        </div>
        {items.length === 0 ? (
          <p className="px-6 py-4 text-sm text-gray-400 dark:text-slate-500">No item details stored.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Medicine Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Batch Number</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Qty Returned</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Purchase Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Reason</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Return Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-3 text-sm text-gray-900 dark:text-slate-100">{item.medicineName || item.name || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-slate-400">{item.batchNumber || item.batch || '-'}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-900 dark:text-slate-100 font-medium">{item.quantity ?? item.returnQty ?? '-'}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-900 dark:text-slate-100">
                      {item.purchasePrice != null ? `₹${Number(item.purchasePrice).toFixed(2)}` : (item.rate != null ? `₹${Number(item.rate).toFixed(2)}` : '-')}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-slate-400">{item.reason || ret.reason || '-'}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-900 dark:text-slate-100 font-medium">
                      {item.purchasePrice != null && (item.quantity ?? item.returnQty) != null 
                        ? `₹${(Number(item.purchasePrice) * Number(item.quantity ?? item.returnQty)).toFixed(2)}`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <td colSpan={5} className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">
                    Total Amount:
                  </td>
                  <td className="px-6 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">
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
