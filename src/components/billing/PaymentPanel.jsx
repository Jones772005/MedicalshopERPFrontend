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
              Received (₹)
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
              className="block w-full rounded-lg border-[#DDE6F0] dark:border-slate-700 bg-white dark:bg-[#102A43] px-3 py-2 text-[13px] font-medium text-[#162033] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2482ED] transition-colors"
            />
          </div>
        )}
      </div>

      {method === 'Cash' && (
        <div className="flex justify-between items-center text-[13px] p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800/50">
          <span className="font-semibold">Change to return:</span>
          <span className="font-bold text-lg">₹{change.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
});

PaymentPanel.displayName = 'PaymentPanel';

export default PaymentPanel;
