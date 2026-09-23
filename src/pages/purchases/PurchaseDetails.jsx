import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, CreditCard, Printer } from 'lucide-react';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getPurchaseById } from '../../services/purchaseApi';
import { getSuppliers } from '../../services/supplierApi';
import { getMedicines } from '../../services/medicineApi';
import { getPurchaseReturns } from '../../services/returnApi';
import { getPayments } from '../../services/paymentApi';

const PurchaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [purchase, setPurchase] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [purchaseReturns, setPurchaseReturns] = useState([]);
  const [refundPayments, setRefundPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [purchaseRes, suppliersRes, medicinesRes, returnsRes, paymentsRes] = await Promise.all([
          getPurchaseById(id),
          getSuppliers(),
          getMedicines(),
          getPurchaseReturns(),
          getPayments()
        ]);
        
        const p = purchaseRes.data;
        setPurchase(p);
        
        const sup = suppliersRes.data.find(s => s.id === p.supplierId);
        setSupplier(sup);
        
        setMedicines(medicinesRes.data);
        
        const pReturns = returnsRes.data.filter(r => String(r.purchaseId) === String(p.id) || (r.purchaseOrderNumber && r.purchaseOrderNumber === p.purchaseOrderNumber));
        setPurchaseReturns(pReturns);
        
        const rPayments = paymentsRes.data.filter(pay => 
          pay.type === 'Refund' && 
          pReturns.some(ret => String(pay.referenceId) === String(ret.id))
        );
        setRefundPayments(rPayments);
      } catch (err) {
        console.error('Failed to fetch purchase details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!purchase) return <div className="p-8 text-center text-gray-500">Purchase not found.</div>;

  const getMedicineName = (medId) => {
    const m = medicines.find(m => m.id === medId);
    return m ? m.name : 'Unknown Medicine';
  };

  const calculateSubtotal = () => {
    return purchase.items.reduce((acc, item) => acc + (item.quantity * item.purchasePrice), 0);
  };
  
  const calculateTotalDiscount = () => {
    return purchase.items.reduce((acc, item) => {
      const sub = item.quantity * item.purchasePrice;
      return acc + (sub * (item.discount / 100));
    }, 0);
  };
  
  const calculateTotalTax = () => {
    return purchase.items.reduce((acc, item) => {
      const sub = item.quantity * item.purchasePrice;
      const d = sub * (item.discount / 100);
      return acc + ((sub - d) * (item.gst / 100));
    }, 0);
  };

  const outstanding = purchase.totalAmount - purchase.paidAmount;
  const totalSupplierRefunds = refundPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const netPurchaseCost = purchase.totalAmount - totalSupplierRefunds;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="ghost" onClick={() => navigate('/purchases')} className="p-2">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Purchase Order: {purchase.purchaseOrderNumber || purchase.id}</h1>
      </div>

      <div className="flex flex-wrap gap-3">
        {(purchase.status === 'Ordered' || purchase.status === 'Partially Received') && (
          <Button onClick={() => navigate(`/purchases/${id}/receive`)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Truck className="w-4 h-4 mr-2" /> Receive Goods
          </Button>
        )}
        {(purchase.paymentStatus === 'Pending' || purchase.paymentStatus === 'Partial') && (
          <Button onClick={() => navigate(`/payments/new?purchaseId=${id}`)} className="bg-green-600 hover:bg-green-700 text-white">
            <CreditCard className="w-4 h-4 mr-2" /> Record Payment
          </Button>
        )}
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Print PO
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Order Date:</span>
              <span className="font-medium text-gray-900 dark:text-white">{new Date(purchase.orderDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Expected Delivery:</span>
              <span className="font-medium text-gray-900 dark:text-white">{new Date(purchase.expectedDeliveryDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Status:</span>
              <StatusBadge status={purchase.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Payment Status:</span>
              <StatusBadge status={purchase.paymentStatus} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Supplier Information</h2>
          {supplier ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Name:</span>
                <span className="font-medium text-gray-900 dark:text-white">{supplier.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Contact:</span>
                <span className="font-medium text-gray-900 dark:text-white">{supplier.contactPerson} ({supplier.phoneNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Email:</span>
                <span className="font-medium text-gray-900 dark:text-white">{supplier.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">GST:</span>
                <span className="font-medium text-gray-900 dark:text-white">{supplier.gstNumber}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Supplier information unavailable.</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Medicine Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-white dark:bg-slate-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Medicine</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Qty</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Price (₹)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">MRP (₹)</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Disc %</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">GST %</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {purchase.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-750/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">{getMedicineName(item.medicineId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100 text-right">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100 text-right">{item.purchasePrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100 text-right">{item.mrp.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100 text-right">{item.discount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100 text-right">{item.gst}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm w-full md:w-80 space-y-3">
          <div className="flex justify-between text-sm text-gray-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span>₹{calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-red-500 dark:text-red-400">
            <span>Discount</span>
            <span>-₹{calculateTotalDiscount().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 dark:text-slate-400">
            <span>GST</span>
            <span>+₹{calculateTotalTax().toFixed(2)}</span>
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-slate-700 flex justify-between font-bold text-lg text-gray-900 dark:text-white">
            <span>Grand Total</span>
            <span>₹{purchase.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Paid Amount</span>
            <span>₹{purchase.paidAmount.toFixed(2)}</span>
          </div>
          <div className="pt-2 flex justify-between font-semibold text-md text-red-600 dark:text-red-400">
            <span>Outstanding</span>
            <span>₹{outstanding > 0 ? outstanding.toFixed(2) : '0.00'}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-200 dark:border-slate-700 pt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Purchase Returns & Supplier Refunds</h2>
        
        {purchaseReturns.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 text-center text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 shadow-sm">
            No purchase returns recorded.
          </div>
        ) : (
          <div className="space-y-6">
            {purchaseReturns.map(ret => {
              const relatedRefunds = refundPayments.filter(p => String(p.referenceId) === String(ret.id));
              const refundedAmount = relatedRefunds.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
              const refundStatus = refundedAmount > 0 
                ? (refundedAmount >= ret.refundAmount ? 'Completed' : 'Partial Refund')
                : 'Refund Pending';

              return (
                <div key={ret.id} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex flex-wrap justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-md font-semibold text-gray-900 dark:text-white">Return ID: {ret.id}</h3>
                      <StatusBadge status={ret.status} />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      Date: {new Date(ret.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Purchase ID</p>
                      <p className="font-medium text-gray-900 dark:text-white">{ret.purchaseOrderNumber || ret.purchaseId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Supplier</p>
                      <p className="font-medium text-gray-900 dark:text-white">{supplier?.supplierName || ret.supplierName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Returned Items</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {ret.items?.length || 0} {(ret.items?.length || 0) === 1 ? 'item' : 'items'} ({ret.items?.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0)} qty)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Return Amount</p>
                      <p className="font-medium text-gray-900 dark:text-white">₹{(Number(ret.refundAmount) || 0).toFixed(2)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Supplier Refund</p>
                      <p className="font-medium text-green-600 dark:text-green-400">₹{refundedAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Refund Status</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        refundStatus === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : refundStatus === 'Partial Refund' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {refundStatus}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="flex justify-end pt-4">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm w-full md:w-80 space-y-3">
                <div className="flex justify-between text-sm text-gray-500 dark:text-slate-400">
                  <span>Original Purchase</span>
                  <span>₹{purchase.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400 border-b border-gray-100 dark:border-slate-700/50 pb-3">
                  <span>Supplier Refund</span>
                  <span>-₹{totalSupplierRefunds.toFixed(2)}</span>
                </div>
                <div className="pt-2 flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                  <span>Net Purchase Cost</span>
                  <span>₹{netPurchaseCost > 0 ? netPurchaseCost.toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default PurchaseDetails;
