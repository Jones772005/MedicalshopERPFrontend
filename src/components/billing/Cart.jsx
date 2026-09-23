import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { calculateItemDiscount, calculateItemSubtotal } from '../../utils/billingCalculations';

const CartQuantityInput = ({ quantity, maxQuantity, onChange }) => {
  const [localVal, setLocalVal] = useState(quantity.toString());

  useEffect(() => {
    setLocalVal(quantity.toString());
  }, [quantity]);

  const handleCommit = () => {
    let val = parseInt(localVal, 10);
    if (isNaN(val) || val <= 0) {
      val = 1; // Fallback to 1 if empty/invalid
    } else if (val > maxQuantity) {
      val = maxQuantity; // Clamp to available stock
    }
    setLocalVal(val.toString());
    if (val !== quantity) {
      onChange(val);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <input
      type="number"
      min="1"
      max={maxQuantity}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={handleCommit}
      onKeyDown={handleKeyDown}
      className="w-12 h-8 text-center text-sm font-medium border border-[#D9E6F2] dark:border-[#263B50] bg-white dark:bg-[#132B42] text-[#102A43] dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#1677FF] focus:border-[#1677FF] rounded-[4px] [&::-webkit-inner-spin-button]:appearance-none transition-colors"
      style={{ MozAppearance: 'textfield' }}
    />
  );
};

const Cart = ({ items, onUpdateQuantity, onRemove, onUpdateDiscount }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-slate-400">
        <p>Cart is empty</p>
        <p className="text-sm">Search for medicines or scan a barcode to add items.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[#DDE6F0] dark:divide-slate-700/50">
        <thead className="bg-[#24C9A0] text-white">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Item</th>
            <th scope="col" className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider">Qty</th>
            <th scope="col" className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Rate</th>
            <th scope="col" className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Disc %</th>
            <th scope="col" className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Amount</th>
            <th scope="col" className="px-4 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-[#102A43] divide-y divide-[#DDE6F0] dark:divide-slate-700/50">
          {items.map((item, index) => (
            <tr key={`${item.medicine.id}-${item.batch.id}`} className="hover:bg-[#F5F8FC] dark:hover:bg-slate-800/50">
              <td className="px-4 py-3">
                <div className="text-[13px] font-semibold text-[#162033] dark:text-white">{item.medicine.name}</div>
                <div className="text-[11px] text-[#64748B] dark:text-slate-400">Batch: {item.batch.batch || item.batch.batchNumber || '-'}</div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <button 
                    onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#F5F8FC] dark:bg-slate-700 text-[#162033] dark:text-slate-300 disabled:opacity-50 hover:bg-[#DDE6F0] dark:hover:bg-slate-600 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  
                  <CartQuantityInput 
                    quantity={item.quantity} 
                    maxQuantity={item.batch.quantity} 
                    onChange={(newQty) => onUpdateQuantity(index, newQty)} 
                  />

                  <button 
                    onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                    disabled={item.quantity >= item.batch.quantity}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#F5F8FC] dark:bg-slate-700 text-[#162033] dark:text-slate-300 disabled:opacity-50 hover:bg-[#DDE6F0] dark:hover:bg-slate-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 text-right text-[13px] text-[#162033] dark:text-white">
                ₹{item.rate.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right">
                {item.discountType ? (
                  <div className="text-[13px] font-semibold text-[#24C9A0] dark:text-emerald-400">
                    {item.discountType === 'percentage' ? `${item.discountValue}%` : `₹${item.discountValue}`}
                    <div className="text-[11px] text-[#64748B] dark:text-slate-400">(-₹{calculateItemDiscount(calculateItemSubtotal(item.quantity, item.rate), item).toFixed(2)})</div>
                  </div>
                ) : (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discount}
                    onChange={(e) => onUpdateDiscount(index, Number(e.target.value) || 0)}
                    className="w-16 p-1 text-right text-[13px] border border-[#DDE6F0] dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-[#162033] dark:text-slate-100 focus:ring-1 focus:ring-[#2482ED]"
                  />
                )}
              </td>
              <td className="px-4 py-3 text-right text-[13px] font-bold text-[#162033] dark:text-white">
                ₹{item.amount.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-center">
                <button 
                  onClick={() => onRemove(index)}
                  className="text-[#64748B] hover:text-red-500 cursor-pointer p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Cart;
