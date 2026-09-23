import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getCustomerById } from '../../services/customerApi';
import { getSales } from '../../services/salesApi';
import { getSalesReturns } from '../../services/returnApi';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [returnHistory, setReturnHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, salesRes, returnsRes] = await Promise.all([
          getCustomerById(id),
          getSales(),
          getSalesReturns()
        ]);

        const custData = custRes.data;
        const allSales = salesRes.data || [];
        const allReturns = returnsRes.data || [];

        // Filter sales for this customer
        const custSales = allSales.filter(s => s.customerId == id);

        // Filter returns for this customer (non-walk-in only, matched by customerId)
        const custReturns = allReturns.filter(
          r => r.customerId != null && String(r.customerId) === String(id)
        );
        custReturns.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        setReturnHistory(custReturns);

        // Calculate true totals from sales
        const totalPurchases = custSales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);

        setCustomer({
          ...custData,
          totalPurchaseAmount: totalPurchases
        });

        // Sort sales desc by date
        custSales.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        setSalesHistory(custSales);

      } catch (error) {
        console.error(error);
        navigate('/customers');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  if (!customer) return null;

  return (
    <div>
      <PageHeader
        title={customer.name}
        description="Customer profile and purchase history."
        action={
          <div className="space-x-3">
            <Button variant="secondary" onClick={() => navigate('/customers')}>Back to List</Button>
            <Button onClick={() => navigate(`/customers/${id}/edit`)}>Edit Customer</Button>
          </div>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">

          {/* Purchase History */}
          <Card>
            <CardHeader><CardTitle>Purchase History</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Recent invoices for this customer.</p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Invoice</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {salesHistory.length === 0 ? (
                      <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400">No purchases found.</td></tr>
                    ) : (
                      salesHistory.map(sale => (
                        <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-slate-750/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-400">
                            <Link to={`/billing/invoice/${sale.id}`} className="hover:underline">{sale.invoiceNumber || `INV-${sale.id}`}</Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{new Date(sale.date || sale.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100 font-medium">₹{(sale.grandTotal || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Return History */}
          <Card>
            <CardHeader><CardTitle>Return History</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Medicines returned by this customer.</p>
              {returnHistory.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">No returns found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-900/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Return ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Invoice</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Medicine</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Batch</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Refund</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Reason</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                      {returnHistory.map(ret => {
                        // One table row per medicine returned; shared cells span across items
                        const items = ret.items && ret.items.length > 0 ? ret.items : [{}];
                        return items.map((item, idx) => (
                          <tr key={`${ret.id}-${idx}`} className="hover:bg-gray-50 dark:hover:bg-slate-750/50">
                            {idx === 0 && (
                              <>
                                <td rowSpan={items.length} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary-600 dark:text-primary-400 align-top">
                                  {ret.id.startsWith('SR-') ? ret.id : `SR-${ret.id}`}
                                </td>
                                <td rowSpan={items.length} className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 align-top">
                                  {ret.invoiceNumber || (ret.saleId ? `INV-${ret.saleId}` : '-')}
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
                              {item.returnQty ?? item.quantity ?? '-'}
                            </td>
                            {idx === 0 && (
                              <>
                                <td rowSpan={items.length} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100 align-top">
                                  ₹{(Number(ret.refundAmount) || 0).toFixed(2)}
                                </td>
                                <td rowSpan={items.length} className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400 align-top">
                                  {ret.reason || ret.globalReason || '-'}
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
            <CardHeader><CardTitle>Profile Summary</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div><dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Phone</dt><dd className="mt-1 text-sm text-gray-900 dark:text-slate-100">{customer.phoneNumber}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Email</dt><dd className="mt-1 text-sm text-gray-900 dark:text-slate-100">{customer.email || '-'}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Address</dt><dd className="mt-1 text-sm text-gray-900 dark:text-slate-100">{customer.address || '-'}</dd></div>
                <hr className="my-4 border-gray-200 dark:border-slate-700" />
                <div><dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Purchases</dt><dd className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">₹{(Number(customer.totalPurchaseAmount) || 0).toFixed(2)}</dd></div>
                <div><dt className="text-sm font-medium text-gray-500 dark:text-slate-400">Loyalty Points</dt><dd className="mt-1 text-lg font-bold text-primary-600 dark:text-primary-400">{customer.loyaltyPoints ?? 0}</dd></div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
