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
                <table className="min-w-full divide-y divide-[#DDE6F0] dark:divide-slate-700/50">
                  <thead className="bg-[#24C9A0] text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Invoice</th>
                      <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#102A43] divide-y divide-[#DDE6F0] dark:divide-slate-700/50">
                    {salesHistory.length === 0 ? (
                      <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-[#64748B] dark:text-[#B8CCE0]">No purchases found.</td></tr>
                    ) : (
                      salesHistory.map(sale => (
                        <tr key={sale.id} className="hover:bg-[#F5F8FC] dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2482ED] dark:text-[#4292F1]">
                            <Link to={`/billing/invoice/${sale.id}`} className="hover:underline">{sale.invoiceNumber || `INV-${sale.id}`}</Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#64748B] dark:text-[#B8CCE0]">{new Date(sale.date || sale.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#162033] dark:text-[#F8FAFC] font-medium">₹{(sale.grandTotal || 0).toFixed(2)}</td>
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
                  <table className="min-w-full divide-y divide-[#DDE6F0] dark:divide-slate-700/50">
                    <thead className="bg-[#24C9A0] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Return ID</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Invoice</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Medicine</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Batch</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Refund</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Reason</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#102A43] divide-y divide-[#DDE6F0] dark:divide-slate-700/50">
                      {returnHistory.map(ret => {
                        // One table row per medicine returned; shared cells span across items
                        const items = ret.items && ret.items.length > 0 ? ret.items : [{}];
                        return items.map((item, idx) => (
                          <tr key={`${ret.id}-${idx}`} className="hover:bg-[#F5F8FC] dark:hover:bg-slate-800/50 transition-colors">
                            {idx === 0 && (
                              <>
                                <td rowSpan={items.length} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#2482ED] dark:text-[#4292F1] align-top">
                                  {ret.id.startsWith('SR-') ? ret.id : `SR-${ret.id}`}
                                </td>
                                <td rowSpan={items.length} className="px-4 py-3 whitespace-nowrap text-sm text-[#64748B] dark:text-[#B8CCE0] align-top">
                                  {ret.invoiceNumber || (ret.saleId ? `INV-${ret.saleId}` : '-')}
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
                              {item.returnQty ?? item.quantity ?? '-'}
                            </td>
                            {idx === 0 && (
                              <>
                                <td rowSpan={items.length} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#162033] dark:text-[#F8FAFC] align-top">
                                  ₹{(Number(ret.refundAmount) || 0).toFixed(2)}
                                </td>
                                <td rowSpan={items.length} className="px-4 py-3 text-sm text-[#64748B] dark:text-[#B8CCE0] align-top">
                                  {ret.reason || ret.globalReason || '-'}
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
            <CardHeader><CardTitle>Profile Summary</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div><dt className="text-[13px] font-bold text-[#162033] dark:text-white mb-1">Phone</dt><dd className="mt-1 text-sm text-[#64748B] dark:text-[#B8CCE0]">{customer.phoneNumber}</dd></div>
                <div><dt className="text-[13px] font-bold text-[#162033] dark:text-white mb-1">Email</dt><dd className="mt-1 text-sm text-[#64748B] dark:text-[#B8CCE0]">{customer.email || '-'}</dd></div>
                <div><dt className="text-[13px] font-bold text-[#162033] dark:text-white mb-1">Address</dt><dd className="mt-1 text-sm text-[#64748B] dark:text-[#B8CCE0]">{customer.address || '-'}</dd></div>
                <hr className="my-4 border-[#DDE6F0] dark:border-slate-700/50" />
                <div><dt className="text-[13px] font-bold text-[#162033] dark:text-white mb-1">Total Purchases</dt><dd className="mt-1 text-2xl font-bold text-[#2482ED] dark:text-[#4292F1]">₹{(Number(customer.totalPurchaseAmount) || 0).toFixed(2)}</dd></div>
                <div><dt className="text-[13px] font-bold text-[#162033] dark:text-white mb-1">Loyalty Points</dt><dd className="mt-1 text-lg font-bold text-[#24C9A0] dark:text-emerald-400">{customer.loyaltyPoints ?? 0}</dd></div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
