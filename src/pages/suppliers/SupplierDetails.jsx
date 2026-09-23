import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getSupplierById } from '../../services/supplierApi';
import { getPurchases } from '../../services/purchaseApi';
import { getPurchaseReturns } from '../../services/returnApi';

const SupplierDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [returnHistory, setReturnHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppRes, purRes, retRes] = await Promise.all([
          getSupplierById(id),
          getPurchases(),
          getPurchaseReturns()
        ]);

        const suppData = suppRes.data;
        const allPurchases = purRes.data || [];
        const allReturns = retRes.data || [];

        // Filter purchases for this supplier
        const suppPurchases = allPurchases.filter(p => p.supplierId == id);

        // Filter purchase returns for this supplier.
        // PurchaseReturns.jsx stores supplierId directly on the return record
        // (sourced from the original purchase at return creation time — see PurchaseReturns.jsx lines 95-96).
        const suppReturns = allReturns.filter(
          r => r.supplierId != null && String(r.supplierId) === String(id)
        );
        suppReturns.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        setReturnHistory(suppReturns);

        // Calculate true outstanding
        const totalOutstanding = suppPurchases.reduce((acc, p) => acc + (p.outstanding || 0), 0);

        setSupplier({
          ...suppData,
          outstandingAmount: totalOutstanding
        });

        // Sort purchases desc by date
        suppPurchases.sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt));
        setPurchaseHistory(suppPurchases);

      } catch (error) {
        console.error(error);
        navigate('/suppliers');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  if (!supplier) return null;

  return (
    <div>
      <PageHeader
        title={supplier.supplierName}
        description="Supplier business details and financial summary."
        action={
          <div className="space-x-3">
            <Button variant="secondary" onClick={() => navigate('/suppliers')}>Back to List</Button>
            <Button onClick={() => navigate(`/suppliers/${id}/edit`)}>Edit Supplier</Button>
          </div>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">

          {/* Purchase History */}
          <Card>
            <CardHeader><CardTitle>Purchase History</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Recent purchase orders and invoices from this supplier.</p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#DDE6F0] dark:divide-slate-700/50">
                  <thead className="bg-[#24C9A0] text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider">PO Number</th>
                      <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#102A43] divide-y divide-[#DDE6F0] dark:divide-slate-700/50">
                    {purchaseHistory.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-[#64748B] dark:text-[#B8CCE0]">No purchases found.</td></tr>
                    ) : (
                      purchaseHistory.map(purchase => (
                        <tr key={purchase.id} className="hover:bg-[#F5F8FC] dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2482ED] dark:text-[#4292F1]">
                            <Link to={`/purchases/${purchase.id}`} className="hover:underline">{purchase.purchaseOrderNumber || purchase.id}</Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#64748B] dark:text-[#B8CCE0]">{new Date(purchase.orderDate || purchase.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#162033] dark:text-[#F8FAFC] font-medium">₹{(purchase.totalAmount || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-[11px] font-bold rounded ${
                              purchase.paymentStatus === 'Paid' ? 'bg-[#24C9A0]/20 text-[#1BA885] dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {purchase.paymentStatus || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Return History */}
          <Card>
            <CardHeader><CardTitle>Purchase Return History</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Goods returned to this supplier.</p>
              {returnHistory.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">No purchase returns found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#DDE6F0] dark:divide-slate-700/50">
                    <thead className="bg-[#24C9A0] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Return ID</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Purchase / PO</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Medicine</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Batch</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Return Amount</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Reason</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#102A43] divide-y divide-[#DDE6F0] dark:divide-slate-700/50">
                      {returnHistory.map(ret => {
                        // One row per medicine returned; shared columns span across items
                        const items = ret.items && ret.items.length > 0 ? ret.items : [{}];
                        return items.map((item, idx) => (
                          <tr key={`${ret.id}-${idx}`} className="hover:bg-[#F5F8FC] dark:hover:bg-slate-800/50 transition-colors">
                            {idx === 0 && (
                              <>
                                <td rowSpan={items.length} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#2482ED] dark:text-[#4292F1] align-top">
                                  {ret.id.startsWith('PR-') ? ret.id : `PR-${ret.id}`}
                                </td>
                                <td rowSpan={items.length} className="px-4 py-3 whitespace-nowrap text-sm text-[#64748B] dark:text-[#B8CCE0] align-top">
                                  {ret.purchaseOrderNumber || (ret.purchaseId ? String(ret.purchaseId) : '-')}
                                </td>
                              </>
                            )}
                            <td className="px-4 py-3 text-sm text-[#162033] dark:text-[#F8FAFC]">
                              {item.medicineName || item.name || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#64748B] dark:text-[#B8CCE0]">
                              {item.batchNumber || item.batch || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#162033] dark:text-[#F8FAFC]">
                              {item.quantity ?? item.returnQty ?? '-'}
                            </td>
                            {idx === 0 && (
                              <>
                                <td rowSpan={items.length} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#162033] dark:text-[#F8FAFC] align-top">
                                  ₹{(Number(ret.refundAmount) || Number(ret.amount) || 0).toFixed(2)}
                                </td>
                                <td rowSpan={items.length} className="px-4 py-3 text-sm text-[#64748B] dark:text-[#B8CCE0] align-top">
                                  {ret.reason || '-'}
                                </td>
                                <td rowSpan={items.length} className="px-4 py-3 whitespace-nowrap text-sm text-[#64748B] dark:text-[#B8CCE0] align-top">
                                  {new Date(ret.date || ret.createdAt).toLocaleDateString()}
                                </td>
                                <td rowSpan={items.length} className="px-4 py-3 whitespace-nowrap align-top">
                                  <span className="inline-flex px-2 py-1 text-[11px] font-bold rounded bg-[#24C9A0]/20 text-[#1BA885] dark:bg-emerald-900/30 dark:text-emerald-400">
                                    {ret.status || 'Processed'}
                                  </span>
                                </td>
                              </>
                            )}
                          </tr>
                        ));
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Supplier Summary</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div><dt className="text-[13px] font-bold text-[#162033] dark:text-white mb-1">Company Name</dt><dd className="mt-1 text-sm text-[#64748B] dark:text-[#B8CCE0]">{supplier.companyName}</dd></div>
                <div><dt className="text-[13px] font-bold text-[#162033] dark:text-white mb-1">Contact Person</dt><dd className="mt-1 text-sm text-[#64748B] dark:text-[#B8CCE0]">{supplier.contactPerson}</dd></div>
                <div><dt className="text-[13px] font-bold text-[#162033] dark:text-white mb-1">Phone</dt><dd className="mt-1 text-sm text-[#64748B] dark:text-[#B8CCE0]">{supplier.phoneNumber}</dd></div>
                <div><dt className="text-[13px] font-bold text-[#162033] dark:text-white mb-1">Email</dt><dd className="mt-1 text-sm text-[#64748B] dark:text-[#B8CCE0]">{supplier.email || '-'}</dd></div>
                <div><dt className="text-[13px] font-bold text-[#162033] dark:text-white mb-1">GST Number</dt><dd className="mt-1 text-sm text-[#64748B] dark:text-[#B8CCE0]">{supplier.gstNumber}</dd></div>
                <div><dt className="text-[13px] font-bold text-[#162033] dark:text-white mb-1">Payment Terms</dt><dd className="mt-1 text-sm text-[#64748B] dark:text-[#B8CCE0]">{supplier.paymentTerms}</dd></div>
                <hr className="my-4 border-[#DDE6F0] dark:border-slate-700/50" />
                <div><dt className="text-[13px] font-bold text-[#162033] dark:text-white mb-1">Outstanding Balance</dt><dd className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">₹{supplier.outstandingAmount.toLocaleString()}</dd></div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetails;
