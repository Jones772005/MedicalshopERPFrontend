import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getSalesReturns, recordSalesReturnRefund } from '../../services/returnApi';
import { getPayments } from '../../services/paymentApi';

const SalesReturnDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ret, setRet] = useState(null);
  const [refundPayment, setRefundPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refund Form State
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundFormAmount, setRefundFormAmount] = useState(0);
  const [refundFormMethod, setRefundFormMethod] = useState('Cash');
  const [refundFormNotes, setRefundFormNotes] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [refundError, setRefundError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [returnsRes, paymentsRes] = await Promise.all([
          getSalesReturns(),
          getPayments()
        ]);

        const allReturns = returnsRes.data || [];
        const found = allReturns.find(r => r.id === id || r.id === String(id));
        if (!found) {
          navigate('/sales/returns');
          return;
        }
        setRet(found);

        // Find the associated refund payment by referenceId or reference field
        const allPayments = paymentsRes.data || [];
        const payment = allPayments.find(p =>
          p.referenceId === found.id ||
          p.referenceId === String(found.id) ||
          p.reference === found.id ||
          p.reference === `SR-${found.id}`
        );
        setRefundPayment(payment || null);
      } catch (err) {
        console.error('Failed to load sales return details:', err);
        navigate('/sales/returns');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleRecordRefund = async () => {
    if (refundFormAmount <= 0) {
      setRefundError('Refund amount must be greater than 0.');
      return;
    }
    if (refundFormAmount > Number(ret.refundAmount || ret.amount || 0)) {
      setRefundError('Refund amount cannot exceed the total return amount.');
      return;
    }

    setRefundError('');
    setSubmittingRefund(true);
    try {
      const res = await recordSalesReturnRefund(ret.id, {
        amount: Number(refundFormAmount),
        paymentMethod: refundFormMethod,
        notes: refundFormNotes
      });
      
      // Update local state
      setRefundPayment(res.data);
      setRet(prev => ({ ...prev, status: 'Refunded' }));
      setShowRefundForm(false);
    } catch (err) {
      setRefundError(err.message || 'Failed to record refund.');
    } finally {
      setSubmittingRefund(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!ret) return null;

  const items = ret.items || [];
  const refundAmount = Number(ret.refundAmount) || Number(ret.amount) || 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Back navigation — same ArrowLeft + ghost button as PurchaseDetails */}
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="ghost" onClick={() => navigate('/sales/returns')} className="p-2">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sales Return: {ret.id}
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
              <span className="text-gray-500 dark:text-slate-400">Original Invoice:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {ret.invoiceNumber ? (
                  <Link to={`/billing/invoice/${ret.saleId}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                    {ret.invoiceNumber}
                  </Link>
                ) : (ret.saleId ? `INV-${ret.saleId}` : '-')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Customer:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {ret.customerId ? (
                  <Link to={`/customers/${ret.customerId}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                    {ret.customerName || 'Customer'}
                  </Link>
                ) : (ret.customerName || 'Walk-in Customer')}
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
              <span className="text-gray-500 dark:text-slate-400">Refund Amount:</span>
              <span className="font-bold text-gray-900 dark:text-white">₹{refundAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Reason:</span>
              <span className="font-medium text-gray-900 dark:text-white">{ret.reason || ret.globalReason || '-'}</span>
            </div>
          </div>
        </div>

        {/* Refund Payment */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Refund Payment</h2>
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
                    ? refundPayment.reference.replace(/^SR-SR-/, 'SR-')
                    : refundPayment.referenceId || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Refund Amount:</span>
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
          ) : ret.status === 'Pending Refund' ? (
            showRefundForm ? (
              <div className="space-y-4">
                {refundError && (
                  <div className="p-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded">
                    {refundError}
                  </div>
                )}
                <div>
                  <Input 
                    label="Refund Amount (₹)" 
                    type="number" 
                    min="0.01" 
                    max={refundAmount} 
                    step="0.01"
                    value={refundFormAmount || refundAmount} 
                    onChange={e => setRefundFormAmount(e.target.value)} 
                  />
                  <p className="text-xs text-gray-500 mt-1">Max: ₹{refundAmount.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Refund Method</label>
                  <select 
                    value={refundFormMethod} 
                    onChange={e => setRefundFormMethod(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-slate-100"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Input 
                    label="Notes / Transaction No (Optional)" 
                    value={refundFormNotes} 
                    onChange={e => setRefundFormNotes(e.target.value)} 
                    placeholder="Enter reference ID"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="secondary" onClick={() => setShowRefundForm(false)} disabled={submittingRefund}>Cancel</Button>
                  <Button onClick={handleRecordRefund} disabled={submittingRefund}>
                    {submittingRefund ? 'Processing...' : 'Confirm Refund'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">No refund payment recorded yet.</p>
                <Button onClick={() => {
                  setRefundFormAmount(refundAmount);
                  setShowRefundForm(true);
                }}>
                  Record Refund
                </Button>
              </div>
            )
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Medicine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Batch</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Qty Returned</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Rate</th>
                  {items.some(i => i.discount) && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Discount</th>
                  )}
                  {items.some(i => i.gst) && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">GST</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Reason</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-3 text-sm text-gray-900 dark:text-slate-100">{item.medicineName || item.name || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-slate-400">{item.batchNumber || item.batch || '-'}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-900 dark:text-slate-100 font-medium">{item.quantity ?? item.returnQty ?? '-'}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-900 dark:text-slate-100">
                      {item.sellingPrice != null ? `₹${Number(item.sellingPrice).toFixed(2)}` : (item.rate != null ? `₹${Number(item.rate).toFixed(2)}` : '-')}
                    </td>
                    {items.some(i => i.discount) && (
                      <td className="px-6 py-3 text-sm text-right text-gray-500 dark:text-slate-400">
                        {item.discount != null ? `${item.discount}%` : '-'}
                      </td>
                    )}
                    {items.some(i => i.gst) && (
                      <td className="px-6 py-3 text-sm text-right text-gray-500 dark:text-slate-400">
                        {item.gst != null ? `${item.gst}%` : '-'}
                      </td>
                    )}
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-slate-400">{item.reason || ret.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <td colSpan={3 + (items.some(i => i.discount) ? 1 : 0) + (items.some(i => i.gst) ? 1 : 0)} className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">
                    Total Refund:
                  </td>
                  <td className="px-6 py-3 text-sm font-bold text-gray-900 dark:text-white text-right" colSpan="2">
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

export default SalesReturnDetails;
