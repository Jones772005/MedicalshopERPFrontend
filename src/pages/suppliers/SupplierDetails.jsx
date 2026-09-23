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
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">PO Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {purchaseHistory.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400">No purchases found.</td></tr>
                    ) : (
                      purchaseHistory.map(purchase => (
                        <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-slate-750/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-400">
                            <Link to={`/purchases/${purchase.id}`} className="hover:underline">{purchase.purchaseOrderNumber || purchase.id}</Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{new Date(purchase.orderDate || purchase.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100 font-medium">₹{(purchase.totalAmount || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              purchase.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
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
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-900/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Return ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Purchase / PO</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Medicine</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Batch</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Return Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Reason</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                      {returnHistory.map(ret => {
                        // One row per medicine returned; shared columns span across items
                        const items = ret.items && ret.items.length > 0 ? ret.items : [{}];
                        return items.map((item, idx) => (
                          <tr key={`${ret.id}-${idx}`} className="hover:bg-gray-50 dark:hover:bg-slate-750/50">
                            {idx === 0 && (
                              <>
                                <td rowSpan={items.length} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary-600 dark:text-primary-400 align-top">
                                  {ret.id.startsWith('PR-') ? ret.id : `PR-${ret.id}`}
                                </td>
                                <td rowSpan={items.length} className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 align-top">
                                  {ret.purchaseOrderNumber || (ret.purchaseId ? String(ret.purchaseId) : '-')}
                                </td>
                              </>
                            )}
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-100">
                              {item.medicineName || item.name || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">
                              {item.batchNumber || item.batch || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-100">
                              {item.quantity ?? item.returnQty ?? '-'}
                            </td>
                            {idx === 0 && (
                              <>
                                <td rowSpan={items.length} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100 align-top">
                                  ₹{(Number(ret.refundAmount) || Number(ret.amount) || 0).toFixed(2)}
                                </td>
                                <td rowSpan={items.length} className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400 align-top">
                                  {ret.reason || '-'}
                                </td>
                                <td rowSpan={items.length} className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 align-top">
                                  {new Date(ret.date || ret.createdAt).toLocaleDateString()}
                                </td>
                                <td rowSpan={items.length} className="px-4 py-3 whitespace-nowrap align-top">
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
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
                <div><dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Company Name</dt><dd className="mt-1 text-sm text-gray-900 dark:text-slate-100">{supplier.companyName}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Contact Person</dt><dd className="mt-1 text-sm text-gray-900 dark:text-slate-100">{supplier.contactPerson}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Phone</dt><dd className="mt-1 text-sm text-gray-900 dark:text-slate-100">{supplier.phoneNumber}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Email</dt><dd className="mt-1 text-sm text-gray-900 dark:text-slate-100">{supplier.email || '-'}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500 dark:text-slate-400">GST Number</dt><dd className="mt-1 text-sm text-gray-900 dark:text-slate-100">{supplier.gstNumber}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Payment Terms</dt><dd className="mt-1 text-sm text-gray-900 dark:text-slate-100">{supplier.paymentTerms}</dd></div>
                <hr className="my-4 border-gray-200 dark:border-slate-700" />
                <div><dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Outstanding Balance</dt><dd className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">₹{supplier.outstandingAmount.toLocaleString()}</dd></div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetails;
