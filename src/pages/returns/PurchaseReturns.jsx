import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Info } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getPurchaseReturns, createPurchaseReturn } from '../../services/returnApi';
import { getPurchaseById, getPurchases } from '../../services/purchaseApi';
import { getMedicines } from '../../services/medicineApi';

const RETURN_REASONS = ['Damaged', 'Quality Issue', 'Wrong Item', 'Overstock', 'Expiry Issue', 'Other'];

const PurchaseReturns = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [searchPurchaseId, setSearchPurchaseId] = useState('');
  const [originalPurchase, setOriginalPurchase] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [globalReason, setGlobalReason] = useState('Damaged');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [searching, setSearching] = useState(false);
  const [availablePurchasesForDropdown, setAvailablePurchasesForDropdown] = useState([]);

  const fetchReturns = async () => {
    try {
      const response = await getPurchaseReturns();
      setReturns(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to load purchase returns:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const currentReturns = await fetchReturns();
      if (location.state?.prefill) {
        setShowReturnForm(true);
        if (location.state.prefill.reason) {
          setGlobalReason(location.state.prefill.reason);
        }
        if (location.state.prefill.sourcePurchaseId) {
          setSearchPurchaseId(location.state.prefill.sourcePurchaseId.toString());
          await loadPurchase(location.state.prefill.sourcePurchaseId, currentReturns);
        } else {
          const allP = await getPurchases();
          let filtered = allP.data.filter(p => p.status === 'Received' || p.status === 'Partially Received');
          
          if (location.state.prefill.possiblePurchaseIds && location.state.prefill.possiblePurchaseIds.length > 0) {
            filtered = filtered.filter(p => location.state.prefill.possiblePurchaseIds.includes(p.id));
          } else if (location.state.prefill.medicineId) {
             // If we didn't have exact batch match in ExpiryManagement, at least filter to purchases containing this medicine
             filtered = filtered.filter(p => {
               const items = p.receivedItems || p.items || [];
               return items.some(i => String(i.medicineId) === String(location.state.prefill.medicineId));
             });
          }
          setAvailablePurchasesForDropdown(filtered);
        }
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPurchase = async (id, currentReturns = returns) => {
    if (!id || !String(id).trim()) return;
    setSearching(true);
    setFormError('');
    setOriginalPurchase(null);
    setReturnItems([]);
    try {
      const [res, medRes] = await Promise.all([
        getPurchaseById(String(id).trim()),
        getMedicines()
      ]);
      const purchase = res.data;
      const allMedicines = medRes.data || [];
      
      if (purchase.status !== 'Received' && purchase.status !== 'Partially Received') {
        setFormError(`Purchase ${id} has not been received yet (status: ${purchase.status}). Only received purchases can be returned.`);
        return;
      }
      
      
      const pastReturns = currentReturns.filter(r => String(r.purchaseId) === String(purchase.id) || r.purchaseOrderNumber === purchase.purchaseOrderNumber);
      
      setOriginalPurchase(purchase);
      setReturnItems((purchase.receivedItems || purchase.items || []).map(item => {
        // Find the original item from the purchase to get the actual purchase price
        const originalItem = (purchase.items || []).find(i => String(i.medicineId) === String(item.medicineId)) || {};
        const purchasePrice = Number(originalItem.purchasePrice ?? originalItem.rate ?? item.purchasePrice ?? item.rate ?? 0);
        
        // Resolve the medicine name using the canonical inventory list
        const med = allMedicines.find(m => String(m.id) === String(item.medicineId));
        const medicineName = med ? med.name : (originalItem.medicineName || originalItem.name || item.medicineName || item.name || 'Unknown Medicine');
        
        const pastReturnedQty = pastReturns.reduce((acc, r) => {
          const rItem = r.items?.find(i => String(i.medicineId) === String(item.medicineId) && (i.batchNumber === item.batchNumber || i.batch === item.batchNumber));
          return acc + (rItem ? rItem.quantity : 0);
        }, 0);
        
        const totalReceived = item.receivedQuantity || item.quantity;
        const maxReturnable = Math.max(0, totalReceived - pastReturnedQty);
        
        return {
          ...item,
          medicineName,
          purchasePrice,
          quantity: totalReceived,
          maxReturnable,
          returnQty: 0
        };
      }));
    } catch (err) {
      setFormError(`Purchase not found: "${id}". Enter a valid Purchase ID.`);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmitReturn = async () => {
    const itemsToReturn = returnItems.filter(i => i.returnQty > 0);
    if (itemsToReturn.length === 0) {
      setFormError('Enter a return quantity for at least one item.');
      return;
    }
    if (itemsToReturn.some(i => (Number(i.purchasePrice) || 0) <= 0)) {
      setFormError('Cannot return items with a zero or missing purchase price. Check original purchase data.');
      return;
    }
    const totalAmount = itemsToReturn.reduce(
      (sum, item) => sum + item.returnQty * (Number(item.purchasePrice) || 0),
      0
    );
    if (totalAmount <= 0) {
      setFormError('Return value is ₹0.00. Ensure the items have a valid purchase price before submitting.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {

      await createPurchaseReturn({
        purchaseId: originalPurchase.id,
        purchaseOrderNumber: originalPurchase.purchaseOrderNumber,
        supplierId: originalPurchase.supplierId || null,
        supplierName: originalPurchase.supplierName || '',
        items: itemsToReturn.map(item => ({
          medicineId: item.medicineId,
          medicineName: item.medicineName || item.name,
          batchNumber: item.batchNumber || item.batch,
          quantity: item.returnQty,
          purchasePrice: Number(item.purchasePrice) || 0,
          reason: globalReason
        })),
        reason: globalReason,
        refundAmount: totalAmount,
        amount: totalAmount
      });

      setLoading(true);
      await fetchReturns();
      setShowReturnForm(false);
      setOriginalPurchase(null);
      setReturnItems([]);
    } catch (err) {
      setFormError(err.message || 'Failed to create return. Please try again.');
      setSubmitting(false);
    }
  };

  const columns = [
    // localDb generates id as "PR-000001" (prefix already included); do not add another "PR-" prefix
    { header: 'Return ID', accessor: 'id', cell: (row) => <span className="font-medium text-primary-600 dark:text-primary-400">{row.id}</span> },
    { header: 'Date', accessor: 'date', cell: (row) => new Date(row.date).toLocaleDateString() },
    // purchaseOrderNumber is undefined for purchases created without that field;
    // fall back to purchaseId which IS the canonical "PUR-000001" ID.
    { header: 'PO No', accessor: 'purchaseOrderNumber', cell: (row) => row.purchaseOrderNumber || row.purchaseId || '-' },
    { header: 'Supplier', accessor: 'supplierName', cell: (row) => row.supplierName || '-' },
    { header: 'Amount', accessor: 'amount', cell: (row) => `₹${(row.amount || row.refundAmount || 0).toFixed(2)}` },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      sortable: false,
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/purchases/returns/${row.id}`)}
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
        <PageHeader title="Purchase Returns" description="Manage supplier returns and debit notes." />
        <Button onClick={() => { setShowReturnForm(true); setOriginalPurchase(null); setReturnItems([]); setSearchPurchaseId(''); setFormError(''); }}>
          Create Return
        </Button>
      </div>

      {showReturnForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Purchase Return</h2>
            <Button variant="secondary" size="sm" onClick={() => { setShowReturnForm(false); setOriginalPurchase(null); setReturnItems([]); navigate('.', { replace: true, state: {} }); }}>Cancel</Button>
          </div>

          {location.state?.prefill && !location.state.prefill.sourcePurchaseId && !originalPurchase && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 rounded shadow-sm">
              <div className="flex">
                <Info className="w-5 h-5 text-blue-400 dark:text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    No matching original purchase was automatically identified. Please select the original purchase for: <strong>{location.state.prefill.medicineName}</strong> (Batch: {location.state.prefill.batch}).
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 items-end">
            {location.state?.prefill && !location.state.prefill.sourcePurchaseId && !originalPurchase ? (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Original Purchase</label>
                <select 
                  value={searchPurchaseId} 
                  onChange={e => setSearchPurchaseId(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Original Purchase ▼</option>
                  {availablePurchasesForDropdown.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {new Date(p.orderDate || p.createdAt).toLocaleDateString()} — {p.supplierName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex-1">
                <Input label="Purchase ID" value={searchPurchaseId} onChange={e => setSearchPurchaseId(e.target.value)} placeholder="Enter Purchase ID (e.g., PUR-000001)" />
              </div>
            )}
            <Button onClick={() => loadPurchase(searchPurchaseId)} disabled={searching || !searchPurchaseId.trim()}>
              {searching ? 'Searching...' : 'Load Purchase'}
            </Button>
          </div>

          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-sm text-red-700 dark:text-red-400">{formError}</p>
            </div>
          )}

          {originalPurchase && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="font-medium text-gray-700 dark:text-slate-300">PO: <span className="text-primary-600 dark:text-primary-400">{originalPurchase.purchaseOrderNumber}</span></span>
                  <span className="font-medium text-gray-700 dark:text-slate-300">Supplier: {originalPurchase.supplierName || '-'}</span>
                  <span className="font-medium text-gray-700 dark:text-slate-300">Date: {new Date(originalPurchase.orderDate || originalPurchase.createdAt).toLocaleDateString()}</span>
                  <span className="font-medium text-gray-700 dark:text-slate-300">Total: ₹{(originalPurchase.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Return Reason</label>
                <select value={globalReason} onChange={e => setGlobalReason(e.target.value)}
                  className="block w-full md:w-80 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Medicine</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Batch</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Received</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Available</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase w-28">Return Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Buy Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {returnItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-750/50">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-100">{item.medicineName || item.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">{item.batchNumber || item.batch || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-100">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm font-medium text-primary-600 dark:text-primary-400">{item.maxReturnable}</td>
                        <td className="px-4 py-3">
                          <input type="number" min="0" max={item.maxReturnable} value={item.returnQty}
                            onChange={e => {
                              const val = Number(e.target.value);
                              if (val > item.maxReturnable) {
                                setFormError(`Return quantity exceeds available stock (${item.maxReturnable}) for ${item.medicineName}.`);
                              } else {
                                setFormError('');
                              }
                              const safeVal = Math.min(Math.max(0, val), item.maxReturnable);
                              setReturnItems(prev => prev.map((it, i) => i === idx ? { ...it, returnQty: safeVal } : it));
                            }}
                            className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-gray-900 dark:text-slate-100" />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-100">₹{(Number(item.purchasePrice) || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 rounded-md p-4">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Return Value: ₹{returnItems.reduce((s, i) => s + i.returnQty * (Number(i.purchasePrice) || 0), 0).toFixed(2)}
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

export default PurchaseReturns;
