import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Eye, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PaymentForm from '../../components/payments/PaymentForm';
import { getPayments } from '../../services/paymentApi';
import { getSuppliers } from '../../services/supplierApi';
import { getCustomers } from '../../services/customerApi';

const PaymentList = () => {
  const [searchParams] = useSearchParams();
  const purchaseId = searchParams.get('purchaseId');

  const [payments, setPayments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(!!purchaseId);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchAllData = async () => {
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
    try {
      const [payRes, supRes, custRes] = await Promise.all([
        getPayments(),
        getSuppliers(),
        getCustomers()
      ]);
      setPayments(payRes.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setSuppliers(supRes.data);
      setCustomers(custRes.data);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    fetchAllData();
  }, []);

  const getEntityName = (row) => {
    // Supplier-side: Purchase payments AND Purchase Return refunds both carry supplierId
    if (row.supplierId) {
      const s = suppliers.find(s => s.id === row.supplierId);
      return s ? `Supplier: ${s.supplierName}` : (row.supplierName ? `Supplier: ${row.supplierName}` : 'Unknown Supplier');
    }
    // Customer-side: Sale payments AND Sales Return refunds both carry customerId
    if (row.customerId) {
      const c = customers.find(c => c.id === row.customerId);
      return c ? `Customer: ${c.name}` : (row.customerName ? `Customer: ${row.customerName}` : 'Walk-in Customer');
    }
    // No party linked
    return row.customerName || row.supplierName || 'Walk-in Customer';
  };

  const getSystemRefId = (row) => {
    let rId = String(row.referenceId);
    
    // Legacy support: if it's purely numeric, convert it to the standardized ERP format
    if (!rId.includes('-')) {
      const padded = rId.padStart(6, '0');
      if (row.type === 'Purchase') return `PUR-${padded}`;
      if (row.type === 'Refund' && row.supplierId) return `PR-${padded}`;
      if (row.type === 'Refund' && row.customerId) return `SR-${padded}`;
      if (row.type === 'Sale') return `INV-2026-${padded}`; // Fallback heuristic for sales if numeric
      return rId;
    }
    
    // Clean up any double prefixes (like PR-PR- or SR-SR-)
    return rId.replace(/^SR-SR-/, 'SR-').replace(/^PR-PR-/, 'PR-');
  };

  const getTransactionNo = (row) => {
    if (row.notes) return row.notes;
    // Fallback to reference field if it's not simply repeating the referenceId
    if (row.reference && String(row.reference) !== String(row.referenceId) && !String(row.reference).match(/^(PR-PR-|SR-SR-|PR-|SR-)/)) {
      return row.reference;
    }
    return '-';
  };

  const getTransactionInfo = (row) => {
    const sysRefId = getSystemRefId(row);
    const txnNo = getTransactionNo(row);
    
    let type = 'Sales Payment';
    let direction = 'INCOMING';
    let color = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';

    if (row.type === 'Purchase') {
      type = 'Purchase Payment';
      direction = 'OUTGOING';
      color = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    } else if (row.type === 'Refund') {
      if (row.supplierId) {
        type = 'Supplier Refund';
        direction = 'INCOMING';
        color = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      } else {
        type = 'Customer Refund';
        direction = 'OUTGOING';
        color = 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      }
    }
    
    return { type, direction, color, refId: sysRefId, txnNo };
  };

  const columns = [
    { 
      header: 'ID', 
      accessor: 'id',
      cell: (row) => {
        const payIdStr = String(row.id);
        const displayId = payIdStr.startsWith('PAY-') ? payIdStr : `PAY-${payIdStr.padStart(6, '0')}`;
        return <span className="text-gray-500">#{displayId}</span>;
      }
    },
    { 
      header: 'Date', 
      accessor: 'date',
      cell: (row) => new Date(row.date).toLocaleString()
    },
    { 
      header: 'Type', 
      accessor: 'type',
      cell: (row) => {
        const info = getTransactionInfo(row);
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${info.color}`}>
            {info.type}
          </span>
        );
      }
    },
    {
      header: 'Direction',
      accessor: 'direction',
      cell: (row) => {
        const info = getTransactionInfo(row);
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            info.direction === 'INCOMING' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
          }`}>
            {info.direction}
          </span>
        );
      }
    },
    { 
      header: 'Party', 
      accessor: 'entity',
      cell: (row) => getEntityName(row)
    },
    { 
      header: 'Ref ID', 
      accessor: 'referenceId',
      cell: (row) => getTransactionInfo(row).refId
    },
    { 
      header: 'Method', 
      accessor: 'method',
      cell: (row) => row.method || row.paymentMethod || '-'
    },
    { 
      header: 'Amount', 
      accessor: 'amount',
      cell: (row) => <span className="font-semibold text-gray-900 dark:text-white">₹{row.amount.toFixed(2)}</span>
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <Button variant="ghost" onClick={() => setSelectedPayment(row)} className="p-1" title="View Details">
          <Eye className="w-4 h-4 text-gray-500 hover:text-primary-600" />
        </Button>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Payments" 
        description="Manage all incoming and outgoing payments."
        action={
          !showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Record Payment
            </Button>
          )
        }
      />

      {showForm && (
        <div className="mb-8">
          <PaymentForm 
            initialData={purchaseId ? { type: 'Purchase', referenceId: purchaseId } : null}
            onCancel={() => setShowForm(false)} 
            onSuccess={() => {
              setShowForm(false);
              // eslint-disable-next-line react/set-state-in-effect
    fetchAllData();
            }}
          />
        </div>
      )}

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Details</h3>
              <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between border-b border-gray-100 dark:border-slate-700/50 pb-2">
                <span className="text-gray-500 dark:text-slate-400">Payment ID:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {String(selectedPayment.id).startsWith('PAY-') ? String(selectedPayment.id) : `PAY-${String(selectedPayment.id).padStart(6, '0')}`}
                </span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 dark:border-slate-700/50 pb-2">
                <span className="text-gray-500 dark:text-slate-400">Reference:</span>
                <span className="font-medium text-primary-600 dark:text-primary-400">{getTransactionInfo(selectedPayment).refId}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 dark:border-slate-700/50 pb-2">
                <span className="text-gray-500 dark:text-slate-400">Transaction No.:</span>
                <span className="font-medium text-gray-900 dark:text-white">{getTransactionInfo(selectedPayment).txnNo}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 dark:border-slate-700/50 pb-2">
                <span className="text-gray-500 dark:text-slate-400">Party:</span>
                <span className="font-medium text-gray-900 dark:text-white">{getEntityName(selectedPayment)}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 dark:border-slate-700/50 pb-2">
                <span className="text-gray-500 dark:text-slate-400">Type:</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTransactionInfo(selectedPayment).color}`}>
                  {getTransactionInfo(selectedPayment).type}
                </span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 dark:border-slate-700/50 pb-2">
                <span className="text-gray-500 dark:text-slate-400">Direction:</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTransactionInfo(selectedPayment).direction === 'INCOMING' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                  {getTransactionInfo(selectedPayment).direction}
                </span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 dark:border-slate-700/50 pb-2">
                <span className="text-gray-500 dark:text-slate-400">Method:</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedPayment.method || selectedPayment.paymentMethod || '-'}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 dark:border-slate-700/50 pb-2">
                <span className="text-gray-500 dark:text-slate-400">Amount:</span>
                <span className="font-bold text-gray-900 dark:text-white">₹{selectedPayment.amount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between pt-1">
                <span className="text-gray-500 dark:text-slate-400">Status:</span>
                <StatusBadge status={selectedPayment.status} />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 rounded-b-lg flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedPayment(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <DataTable 
        columns={columns} 
        data={payments} 
        searchPlaceholder="Search payments..."
      />
    </div>
  );
};

export default PaymentList;
