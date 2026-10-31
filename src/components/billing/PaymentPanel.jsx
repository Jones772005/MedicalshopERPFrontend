import { useState, useRef, forwardRef } from 'react';

const PaymentPanel = forwardRef(({ 
  grandTotal, 
  onPaymentMethodChange, 
  onAmountReceivedChange, 
  onPaymentComplete 
}, ref) => {
  const [method, setMethod] = useState('Cash');
  const [received, setReceived] = useState(grandTotal);

  const internalSelectRef = useRef(null);
  const selectRef = ref || internalSelectRef;
  const receivedInputRef = useRef(null);

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

  const handleMethodKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (method === 'Cash') {
        receivedInputRef.current?.focus();
        receivedInputRef.current?.select();
      } else if (onPaymentComplete) {
        onPaymentComplete();
      }
    }
  };

  const handleReceivedKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onPaymentComplete) {
        onPaymentComplete();
      }
    }
  };

  const change = Math.max(0, received - grandTotal);

  return (
    <div className="space-y-4 border-t border-[#DDE6F0] dark:border-slate-700/50 pt-4 mt-4">
      <h3 className="text-[13px] font-bold text-[#162033] dark:text-white uppercase tracking-wider">
        Payment
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="paymentMethodSelect" className="block text-[13px] font-bold text-[#162033] dark:text-white mb-1">
            Method
          </label>
          <select 
            ref={selectRef}
            id="paymentMethodSelect"
            value={method}
            onChange={handleMethodChange}
            onKeyDown={handleMethodKeyDown}
            aria-label="Payment Method"
            className="block w-full rounded-lg border-[#DDE6F0] dark:border-slate-700 bg-white dark:bg-[#102A43] px-3 py-2 text-[13px] font-medium text-[#162033] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2482ED] transition-colors cursor-pointer"
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {method === 'Cash' && (
          <div>
            <label htmlFor="amountReceivedInput" className="block text-[13px] font-bold text-[#162033] dark:text-white mb-1">
              Received (₹) <span className="text-red-500">*</span>
            </label>
            <input 
              ref={receivedInputRef}
              id="amountReceivedInput"
              type="number"
              min={grandTotal}
              step="0.01"
              value={received}
              onChange={handleReceivedChange}
              onFocus={(e) => e.target.select()}
              onKeyDown={handleReceivedKeyDown}
              aria-label="Amount Received"
              className={`block w-full rounded-lg border bg-white dark:bg-[#102A43] px-3 py-2 text-[13px] font-medium text-[#162033] dark:text-white focus:outline-none focus:ring-2 transition-colors ${
                received < grandTotal && grandTotal > 0
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-[#DDE6F0] dark:border-slate-700 focus:ring-[#2482ED]'
              }`}
            />
            {received < grandTotal && grandTotal > 0 && (
              <p className="mt-1 text-[11px] text-red-500 dark:text-red-400">
                Amount cannot be less than Grand Total (₹{grandTotal.toFixed(2)})
              </p>
            )}
          </div>
        )}
      </div>

      {method === 'Cash' && (
        <div className={`flex justify-between items-center text-[13px] p-3 rounded-lg border ${
          received < grandTotal && grandTotal > 0
            ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800/50'
            : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800/50'
        }`}>
          <span className="font-semibold">
            {received < grandTotal && grandTotal > 0 ? 'Shortfall:' : 'Change to return:'}
          </span>
          <span className="font-bold text-lg">
            ₹{received < grandTotal && grandTotal > 0 ? (grandTotal - received).toFixed(2) : change.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
});

PaymentPanel.displayName = 'PaymentPanel';

export default PaymentPanel;
