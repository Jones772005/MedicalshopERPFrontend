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
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-900/50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Item</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Qty</th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Rate</th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Disc %</th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Amount</th>
            <th scope="col" className="px-4 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
          {items.map((item, index) => (
            <tr key={`${item.medicine.id}-${item.batch.id}`} className="hover:bg-gray-50 dark:hover:bg-slate-750/50">
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{item.medicine.name}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">Batch: {item.batch.batch || item.batch.batchNumber || '-'}</div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <button 
                    onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="flex items-center justify-center w-8 h-8 rounded-[4px] bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
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
                    className="flex items-center justify-center w-8 h-8 rounded-[4px] bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                ₹{item.rate.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right">
                {item.discountType ? (
                  <div className="text-sm font-medium text-green-600 dark:text-green-400">
                    {item.discountType === 'percentage' ? `${item.discountValue}%` : `₹${item.discountValue}`}
                    <div className="text-xs text-gray-500">(-₹{calculateItemDiscount(calculateItemSubtotal(item.quantity, item.rate), item).toFixed(2)})</div>
                  </div>
                ) : (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discount}
                    onChange={(e) => onUpdateDiscount(index, Number(e.target.value) || 0)}
                    className="w-16 p-1 text-right text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-primary-500"
                  />
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                ₹{item.amount.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-center">
                <button 
                  onClick={() => onRemove(index)}
                  className="text-red-500 hover:text-red-700 cursor-pointer p-1"
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
