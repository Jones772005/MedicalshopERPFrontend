import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getSalesReturns, createSalesReturn } from '../../services/returnApi';
import { getSaleById } from '../../services/salesApi';
import { calculateItemAmount } from '../../utils/billingCalculations';

const RETURN_REASONS = ['Customer Return', 'Damaged', 'Defective', 'Wrong Medicine', 'Expiry Issue', 'Other'];

const SalesReturns = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invoiceIdParam = searchParams.get('invoiceId');

  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Return creation state
  const [showReturnForm, setShowReturnForm] = useState(!!invoiceIdParam);
  const [searchInvoiceId, setSearchInvoiceId] = useState(invoiceIdParam || '');
  const [originalSale, setOriginalSale] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [globalReason, setGlobalReason] = useState('Customer Return');
  const [refundMethod, setRefundMethod] = useState('Cash');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [searching, setSearching] = useState(false);

  const fetchReturns = async () => {
    try {
      const response = await getSalesReturns();
      setReturns(response.data);
    } catch (err) {
      console.error('Failed to load sales returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  useEffect(() => {
    if (invoiceIdParam) {
      loadInvoice(invoiceIdParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceIdParam]);

  const loadInvoice = async (id) => {
    if (!id || !String(id).trim()) return;
    setSearching(true);
    setFormError('');
    setOriginalSale(null);
    setReturnItems([]);
    try {
      const res = await getSaleById(String(id).trim());
      const sale = res.data;
      setOriginalSale(sale);
      setReturnItems((sale.items || []).map(item => ({
        ...item,
        returnQty: 0,
        restockable: true
      })));
    } catch (err) {
      setFormError(`Invoice not found: "${id}". Enter a valid Invoice Number or numeric ID.`);
    } finally {
      setSearching(false);
    }
  };

  const getRefundableAmount = (item, qty = item.returnQty) => {
    if (qty <= 0) return 0;
    if (item.discountedRate !== undefined) {
      return calculateItemAmount(qty, item.discountedRate, 0, item.gst || 0);
    }
    // Legacy support
    return calculateItemAmount(qty, item.rate || item.sellingPrice || 0, item.discount || 0, item.gst || 0);
  };

  const getDiscountDisplay = (item) => {
    if (item.discountType === 'fixed') return `-₹${Number(item.discountValue || 0).toFixed(2)}`;
    if (item.discountType === 'percentage' || item.discountType === 'manual') return `${item.discountValue || item.discount || 0}%`;
    if (typeof item.discount === 'number' && item.discount > 0) return `${item.discount}%`;
    return '-';
  };

  const handleSubmitReturn = async () => {
    const itemsToReturn = returnItems.filter(i => i.returnQty > 0);
    if (itemsToReturn.length === 0) {
      setFormError('Enter a return quantity for at least one item.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      const totalRefund = itemsToReturn.reduce((sum, item) => sum + getRefundableAmount(item), 0);

      await createSalesReturn({
        saleId: originalSale.id,
        invoiceNumber: originalSale.invoiceNumber,
        customerId: originalSale.customerId || null,
        customerName: originalSale.customerName || 'Walk-in',
        items: itemsToReturn.map(item => ({
          medicineId: item.medicineId,
          medicineName: item.medicineName || item.name,
          batchNumber: item.batchNumber || item.batch,
          quantity: item.returnQty,
          sellingPrice: Number(item.sellingPrice) || Number(item.mrp) || 0,
          reason: globalReason,
          restockable: item.restockable
        })),
        reason: globalReason,
        refundAmount: totalRefund,
        paymentMethod: refundMethod,
        amount: totalRefund
      });

      setLoading(true);
      await fetchReturns();
      setShowReturnForm(false);
      setOriginalSale(null);
      setReturnItems([]);
      navigate('/sales/returns');
    } catch (err) {
      setFormError(err.message || 'Failed to create return. Please try again.');
      setSubmitting(false);
    }
  };

  const columns = [
    // localDb generates id as "SR-000001" (prefix already included) — do not add another "SR-" prefix
    { header: 'Return ID', accessor: 'id', cell: (row) => <span className="font-medium text-primary-600 dark:text-primary-400">{row.id}</span> },
    { header: 'Date', accessor: 'date', cell: (row) => new Date(row.date).toLocaleDateString() },
    { header: 'Invoice No', accessor: 'invoiceNumber', cell: (row) => row.invoiceNumber || '-' },
    { header: 'Customer', accessor: 'customerName', cell: (row) => row.customerName || 'Walk-in' },
    { header: 'Amount', accessor: 'amount', cell: (row) => `₹${(row.amount || row.refundAmount || 0).toFixed(2)}` },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      sortable: false,
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/sales/returns/${row.id}`)}
          title="View Return"
        >
          <Eye className="w-4 h-4" />
        </Button>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Sales Returns" description="Manage customer returns and refunds." />
        <Button onClick={() => { setShowReturnForm(true); setOriginalSale(null); setReturnItems([]); setSearchInvoiceId(''); setFormError(''); }}>
          Create Return
        </Button>
      </div>

      {showReturnForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Sales Return</h2>
            <Button variant="secondary" size="sm" onClick={() => { setShowReturnForm(false); setOriginalSale(null); setReturnItems([]); }}>Cancel</Button>
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                label="Invoice Number or ID"
                value={searchInvoiceId}
                onChange={e => setSearchInvoiceId(e.target.value)}
                placeholder="e.g. INV-2026-001 or numeric ID"
              />
            </div>
            <Button onClick={() => loadInvoice(searchInvoiceId)} disabled={searching || !searchInvoiceId.trim()}>
              {searching ? 'Searching...' : 'Load Invoice'}
            </Button>
          </div>

          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-sm text-red-700 dark:text-red-400">{formError}</p>
            </div>
          )}

          {originalSale && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="font-medium text-gray-700 dark:text-slate-300">Invoice: <span className="text-primary-600 dark:text-primary-400">{originalSale.invoiceNumber}</span></span>
                  <span className="font-medium text-gray-700 dark:text-slate-300">Customer: {originalSale.customerName || 'Walk-in'}</span>
                  <span className="font-medium text-gray-700 dark:text-slate-300">Date: {new Date(originalSale.date || originalSale.createdAt).toLocaleDateString()}</span>
                  <span className="font-medium text-gray-700 dark:text-slate-300">Total: ₹{(originalSale.grandTotal || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Return Reason</label>
                  <select value={globalReason} onChange={e => setGlobalReason(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Refund Method</label>
                  <select value={refundMethod} onChange={e => setRefundMethod(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Store Credit">Store Credit</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Medicine</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Batch</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Sold</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase w-28">Return Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Discount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Refund</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Restock?</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {returnItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-750/50">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-100">{item.medicineName || item.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">{item.batchNumber || item.batch || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-100">{item.quantity}</td>
                        <td className="px-4 py-3">
                          <input type="number" min="0" max={item.quantity} value={item.returnQty}
                            onChange={e => {
                              const val = Math.min(Math.max(0, Number(e.target.value)), item.quantity);
                              setReturnItems(prev => prev.map((it, i) => i === idx ? { ...it, returnQty: val } : it));
                            }}
                            className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-gray-900 dark:text-slate-100" />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-100">₹{(Number(item.rate) || Number(item.sellingPrice) || Number(item.mrp) || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-100">{getDiscountDisplay(item)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-100">₹{getRefundableAmount(item).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={item.restockable}
                            onChange={e => setReturnItems(prev => prev.map((it, i) => i === idx ? { ...it, restockable: e.target.checked } : it))}
                            className="h-4 w-4 text-primary-600 rounded border-gray-300" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 rounded-md p-4">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Estimated Refund: ₹{returnItems.reduce((s, i) => s + getRefundableAmount(i), 0).toFixed(2)}
                </span>
                <Button onClick={handleSubmitReturn} disabled={submitting}>
                  {submitting ? 'Processing...' : 'Submit Return'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <DataTable columns={columns} data={returns} searchPlaceholder="Search returns..." />
    </div>
  );
};

export default SalesReturns;
