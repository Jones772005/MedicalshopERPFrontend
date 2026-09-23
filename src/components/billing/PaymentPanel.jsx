import { useState } from 'react';

const PaymentPanel = ({ grandTotal, onPaymentMethodChange, onAmountReceivedChange }) => {
  const [method, setMethod] = useState('Cash');
  const [received, setReceived] = useState(grandTotal);

  const handleMethodChange = (e) => {
    const newMethod = e.target.value;
    setMethod(newMethod);
    onPaymentMethodChange(newMethod);
    if (newMethod !== 'Cash') {
      setReceived(grandTotal);
      onAmountReceivedChange(grandTotal);
    }
  };

  const handleReceivedChange = (e) => {
    const val = Number(e.target.value) || 0;
    setReceived(val);
    onAmountReceivedChange(val);
  };

  const change = Math.max(0, received - grandTotal);

  return (
    <div className="space-y-4 border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">Payment</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Method</label>
          <select 
            value={method}
            onChange={handleMethodChange}
            className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Credit Card">Credit Card</option>
          </select>
        </div>

        {method === 'Cash' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Received (₹)</label>
            <input 
              type="number"
              min={grandTotal}
              step="0.01"
              value={received}
              onChange={handleReceivedChange}
              className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        )}
      </div>

      {method === 'Cash' && (
        <div className="flex justify-between items-center text-sm p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-md border border-green-200 dark:border-green-800">
          <span className="font-medium">Change to return:</span>
          <span className="font-bold text-lg">₹{change.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};

export default PaymentPanel;
