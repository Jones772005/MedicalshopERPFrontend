import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Keyboard } from 'lucide-react';

import ProductSearch from '../../components/billing/ProductSearch';
import BarcodeInput from '../../components/billing/BarcodeInput';
import BatchSelector from '../../components/billing/BatchSelector';
import Cart from '../../components/billing/Cart';
import CustomerSelector from '../../components/billing/CustomerSelector';
import PaymentPanel from '../../components/billing/PaymentPanel';
import Button from '../../components/common/Button';

import { 
  calculateItemAmount, 
  calculateCartSubtotal, 
  calculateCartDiscount, 
  calculateItemDiscount,
  calculateItemSubtotal,
  calculateCartTaxWithOverallDiscount,
  calculateGrandTotalWithOverallDiscount,
  resolveOverallDiscountAmount
} from '../../utils/billingCalculations';
import { createSale } from '../../services/salesApi';
import { getDiscountForMedicine } from '../../services/discountApi';

const POS = () => {
  const navigate = useNavigate();
  const [activeMedicine, setActiveMedicine] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [customer, setCustomer] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountReceived, setAmountReceived] = useState(0); // eslint-disable-line no-unused-vars
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallDiscountType, setOverallDiscountType] = useState('percentage');
  const [overallDiscountValue, setOverallDiscountValue] = useState(0);

  // Cart selection & focus tracking
  const [selectedCartIndex, setSelectedCartIndex] = useState(0);
  const [focusQuantityTrigger, setFocusQuantityTrigger] = useState(null);

  // DOM Refs for predictable keyboard navigation
  const medicineSearchRef = useRef(null);
  const customerSearchRef = useRef(null);
  const paymentMethodRef = useRef(null);
  const overallDiscountRef = useRef(null);
  const prescriptionCheckboxRef = useRef(null);
  const generateBillBtnRef = useRef(null);

  // Prescription Integration
  const [prescriptionVerified, setPrescriptionVerified] = useState(false);
  const cartRequiresPrescription = cartItems.some(item => item.medicine.prescriptionRequired);

  // Focus medicine search on mount (Step 1 of keyboard flow)
  useEffect(() => {
    const timer = setTimeout(() => {
      medicineSearchRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Global POS Shortcuts (Section 2)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // F2: Focus medicine search
      if (e.key === 'F2') {
        e.preventDefault();
        medicineSearchRef.current?.focus();
        return;
      }

      // F3: Focus customer selector
      if (e.key === 'F3') {
        e.preventDefault();
        customerSearchRef.current?.focus();
        return;
      }

      // F4: Focus payment section / payment method
      if (e.key === 'F4') {
        e.preventDefault();
        paymentMethodRef.current?.focus();
        return;
      }

      // F6: Focus quantity of the currently selected cart item
      if (e.key === 'F6') {
        e.preventDefault();
        if (cartItems.length > 0) {
          const targetIndex = (selectedCartIndex >= 0 && selectedCartIndex < cartItems.length) 
            ? selectedCartIndex 
            : cartItems.length - 1;
          setFocusQuantityTrigger(prev => ({ index: targetIndex, id: (prev ? prev.id + 1 : 1) }));
        }
        return;
      }

      // F8: Focus overall discount field
      if (e.key === 'F8') {
        e.preventDefault();
        overallDiscountRef.current?.focus();
        overallDiscountRef.current?.select();
        return;
      }

      // F9: Focus Generate Bill button
      if (e.key === 'F9') {
        e.preventDefault();
        if (cartItems.length === 0) {
          medicineSearchRef.current?.focus();
        } else if (cartRequiresPrescription && !prescriptionVerified) {
          prescriptionCheckboxRef.current?.focus();
        } else {
          generateBillBtnRef.current?.focus();
        }
        return;
      }

      // Esc: Close currently open dropdown/modal/popover without destructive action
      if (e.key === 'Escape') {
        if (activeMedicine) {
          e.preventDefault();
          setActiveMedicine(null);
          medicineSearchRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeMedicine, cartItems.length, selectedCartIndex, cartRequiresPrescription, prescriptionVerified]);

  const handleProductSelect = (medicine) => {
    setActiveMedicine(medicine);
  };

  const handleBatchSelect = async (batch) => {
    // Check if batch is already in cart
    const existingIndex = cartItems.findIndex(
      item => item.medicine.id === activeMedicine.id && item.batch.id === batch.id
    );

    if (existingIndex >= 0) {
      // Just increase quantity if possible
      handleUpdateQuantity(existingIndex, cartItems[existingIndex].quantity + 1);
      setSelectedCartIndex(existingIndex);
      setFocusQuantityTrigger(prev => ({ index: existingIndex, id: (prev ? prev.id + 1 : 1) }));
    } else {
      // Fetch applicable discount
      const { data: discountRule } = await getDiscountForMedicine(activeMedicine.id, batch.batch || batch.batchNumber);

      // Add new item
      const rate = batch.sellingPrice || batch.mrp || 0;
      
      const newItem = {
        medicine: activeMedicine,
        batch: batch,
        quantity: 1,
        rate: rate,
        gst: activeMedicine.gst || 0,
      };

      if (discountRule) {
        newItem.discountType = discountRule.discountType;
        newItem.discountValue = discountRule.discountValue;
        newItem.maxDiscountAmount = discountRule.maxDiscountAmount;
        newItem.appliedDiscountRule = discountRule.id;
      } else {
        newItem.discount = 0; // Legacy manual discount
      }

      newItem.amount = calculateItemAmount(1, rate, newItem, activeMedicine.gst || 0);

      const targetIdx = cartItems.length;
      setCartItems((prev) => [...prev, newItem]);
      setSelectedCartIndex(targetIdx);
      // Immediately transfer keyboard focus to the quantity input of the newly added item
      setFocusQuantityTrigger(prev => ({ index: targetIdx, id: (prev ? prev.id + 1 : 1) }));
    }
    
    setActiveMedicine(null);
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    const updated = [...cartItems];
    const item = updated[index];
    
    if (newQuantity <= 0) return;
    if (newQuantity > item.batch.quantity) {
      return;
    }

    item.quantity = newQuantity;
    item.amount = calculateItemAmount(item.quantity, item.rate, item, item.gst);
    setCartItems(updated);
  };

  const handleUpdateDiscount = (index, newDiscount) => {
    const updated = [...cartItems];
    const item = updated[index];
    
    item.discount = newDiscount;
    item.amount = calculateItemAmount(item.quantity, item.rate, item, item.gst);
    setCartItems(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
    if (updated.length === 0) {
      medicineSearchRef.current?.focus();
    } else {
      const nextIdx = Math.min(index, updated.length - 1);
      setSelectedCartIndex(nextIdx);
    }
  };

  const handleClearBill = () => {
    setCartItems([]);
    setCustomer(null);
    setPaymentMethod('Cash');
    setAmountReceived(0);
    setPrescriptionVerified(false);
    setOverallDiscountType('percentage');
    setOverallDiscountValue(0);
    medicineSearchRef.current?.focus();
  };

  const subtotal = calculateCartSubtotal(cartItems);
  const totalDiscount = calculateCartDiscount(cartItems);
  // Resolve overall discount (percentage or amount) to a ₹ value, already clamped
  const effectiveOverallDiscount = resolveOverallDiscountAmount(cartItems, overallDiscountType, overallDiscountValue);
  const totalTax = calculateCartTaxWithOverallDiscount(cartItems, effectiveOverallDiscount);
  const grandTotal = calculateGrandTotalWithOverallDiscount(cartItems, effectiveOverallDiscount);

  const isGenerateDisabled = cartItems.length === 0 || isSubmitting || (cartRequiresPrescription && !prescriptionVerified);

  const handleGenerateBill = async () => {
    if (isGenerateDisabled) return;
    setIsSubmitting(true);

    try {
      const formattedItems = cartItems.map(item => ({
        medicineId: item.medicine.id,
        medicineName: item.medicine.name,
        batchNumber: item.batch?.batch || item.batch?.batchNumber,
        expiryDate: item.batch?.expiryDate,
        quantity: item.quantity,
        rate: item.rate,
        mrp: item.batch.mrp,
        sellingPrice: item.batch.sellingPrice || item.rate || item.batch.mrp || 0,
        purchasePrice: item.batch.purchasePrice || 0,
        discount: item.discount, // Legacy manual discount percentage if no rule
        discountType: item.discountType,
        discountValue: item.discountValue,
        discountAmount: calculateItemDiscount(calculateItemSubtotal(item.quantity, item.rate), item),
        maxDiscountAmount: item.maxDiscountAmount,
        appliedDiscountRule: item.appliedDiscountRule,
        discountedRate: Math.max(0, item.rate - (calculateItemDiscount(calculateItemSubtotal(1, item.rate), item))),
        gst: item.gst,
        amount: item.amount
      }));

      const saleData = {
        customerId: customer ? customer.id : null,
        customerName: customer ? customer.name : 'Walk-in',
        cashier: 'Admin', // In real app, from AuthContext
        subtotal,
        discount: totalDiscount,
        overallDiscount: effectiveOverallDiscount,
        overallDiscountType,
        overallDiscountValue,
        tax: totalTax,
        grandTotal,
        paymentMethod,
        paymentStatus: 'Paid',
        items: formattedItems
      };

      const response = await createSale(saleData);
      // Navigate to invoice
      navigate(`/billing/invoice/${response.data.id}`);
    } catch (err) {
      console.error('Failed to generate bill', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col justify-between gap-3">
      
      {/* MAIN 3-COLUMN LAYOUT */}
      <div className="flex-grow min-h-0 flex flex-col xl:flex-row gap-4">
        
        {/* LEFT COLUMN: Search & Batch Selection (30%) */}
        <div className="w-full xl:w-[30%] flex flex-col space-y-4">
          <div className="bg-white dark:bg-[#102A43] p-4 rounded-xl shadow-sm border border-[#DDE6F0] dark:border-slate-700/50 flex flex-col h-full">
            <h2 className="text-[15px] font-bold text-[#162033] dark:text-white mb-4">Product Search</h2>
            
            <div className="space-y-4">
              <BarcodeInput onBarcodeDetected={(code) => console.log('Barcode scanned:', code)} />
              <div className="relative z-20">
                <ProductSearch 
                  ref={medicineSearchRef} 
                  onProductSelect={handleProductSelect} 
                />
              </div>
            </div>

            <div className="mt-6 flex-grow border-t border-[#DDE6F0] dark:border-slate-700/50 pt-4 relative z-10">
              {activeMedicine ? (
                <BatchSelector 
                  medicine={activeMedicine} 
                  onSelect={handleBatchSelect} 
                  onCancel={() => {
                    setActiveMedicine(null);
                    medicineSearchRef.current?.focus();
                  }} 
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#64748B] dark:text-slate-500">
                  <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-[13px] font-medium">Search for a product to begin billing</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Cart (40%) */}
        <div className="w-full xl:w-[40%] flex flex-col">
          <div className="bg-white dark:bg-[#102A43] rounded-xl shadow-sm border border-[#DDE6F0] dark:border-slate-700/50 flex flex-col h-full overflow-hidden">
            
            {/* Header */}
            <div className="px-5 py-3 border-b border-[#DDE6F0] dark:border-slate-700/50 bg-[#F5F8FC] dark:bg-slate-800/50 flex justify-between items-center">
              <h2 className="text-[15px] font-bold text-[#162033] dark:text-white">Current Bill</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearBill} 
                className="text-[#64748B] hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Clear Bill
              </Button>
            </div>

            {/* Cart Area */}
            <div className="flex-grow overflow-y-auto bg-white dark:bg-[#102A43]">
              <Cart 
                items={cartItems} 
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                onUpdateDiscount={handleUpdateDiscount}
                selectedItemIndex={selectedCartIndex}
                onSelectItemIndex={setSelectedCartIndex}
                focusQuantityTrigger={focusQuantityTrigger}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Customer, Payment & Checkout (30%) */}
        <div className="w-full xl:w-[30%] flex flex-col">
          <div className="bg-white dark:bg-[#102A43] rounded-xl shadow-sm border border-[#DDE6F0] dark:border-slate-700/50 flex flex-col h-full overflow-hidden">
            
            <div className="flex-grow overflow-y-auto p-5 space-y-6">
              <CustomerSelector 
                ref={customerSearchRef} 
                onSelect={setCustomer} 
                onSelectComplete={() => {
                  if (cartItems.length > 0) {
                    overallDiscountRef.current?.focus();
                    overallDiscountRef.current?.select();
                  } else {
                    paymentMethodRef.current?.focus();
                  }
                }}
              />
              <PaymentPanel 
                ref={paymentMethodRef}
                grandTotal={grandTotal} 
                onPaymentMethodChange={setPaymentMethod} 
                onAmountReceivedChange={setAmountReceived} 
                onPaymentComplete={() => {
                  if (cartRequiresPrescription && !prescriptionVerified) {
                    prescriptionCheckboxRef.current?.focus();
                  } else {
                    generateBillBtnRef.current?.focus();
                  }
                }}
              />
            </div>

            {/* Totals & Submit */}
            <div className="border-t border-[#DDE6F0] dark:border-slate-700/50 p-5 bg-[#F5F8FC] dark:bg-slate-800/50 flex flex-col justify-end space-y-3">
              <div className="flex justify-between text-[13px] font-semibold text-[#64748B] dark:text-slate-400">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px] font-semibold text-red-500 dark:text-red-400">
                <span>Item Discount</span>
                <span>-₹{totalDiscount.toFixed(2)}</span>
              </div>

              {/* Overall Bill Discount — Type Selector + Value Input */}
              <div className="flex justify-between items-center text-[13px] font-semibold text-orange-600 dark:text-orange-400 gap-2">
                <label htmlFor="overallDiscountValue" className="whitespace-nowrap cursor-pointer">
                  Overall Discount (F8)
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    id="overallDiscountType"
                    aria-label="Overall discount type"
                    value={overallDiscountType}
                    disabled={cartItems.length === 0}
                    onChange={(e) => {
                      setOverallDiscountType(e.target.value);
                      setOverallDiscountValue(0);
                    }}
                    className="h-[30px] px-1.5 text-[12px] font-bold border border-orange-300 dark:border-orange-700/50 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="percentage">%</option>
                    <option value="amount">₹</option>
                  </select>
                  <input
                    ref={overallDiscountRef}
                    id="overallDiscountValue"
                    aria-label="Overall discount value"
                    type="number"
                    min="0"
                    max={overallDiscountType === 'percentage' ? 100 : undefined}
                    step="0.01"
                    value={overallDiscountValue || ''}
                    disabled={cartItems.length === 0}
                    placeholder="0"
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        paymentMethodRef.current?.focus();
                      }
                    }}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '' || raw === null) {
                        setOverallDiscountValue(0);
                        return;
                      }
                      const val = parseFloat(raw);
                      if (isNaN(val) || val < 0) {
                        setOverallDiscountValue(0);
                      } else if (overallDiscountType === 'percentage' && val > 100) {
                        setOverallDiscountValue(100);
                      } else {
                        setOverallDiscountValue(val);
                      }
                    }}
                    className="w-20 text-right px-2 py-1 text-[13px] font-semibold border border-orange-300 dark:border-orange-700/50 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ MozAppearance: 'textfield' }}
                  />
                </div>
              </div>
              {effectiveOverallDiscount > 0 && (
                <div className="flex justify-between text-[12px] text-orange-500 dark:text-orange-400">
                  <span>
                    {overallDiscountType === 'percentage' && overallDiscountValue > 0
                      ? `${overallDiscountValue}%`
                      : ''}
                  </span>
                  <span>-₹{effectiveOverallDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-[13px] font-semibold text-[#64748B] dark:text-slate-400">
                <span>GST</span>
                <span>+₹{totalTax.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-[#DDE6F0] dark:border-slate-700/50 flex justify-between font-bold text-xl text-[#162033] dark:text-white">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              {cartRequiresPrescription && (
                <div className="pt-2 flex items-center space-x-2">
                  <input 
                    ref={prescriptionCheckboxRef}
                    type="checkbox" 
                    id="prescriptionVerified" 
                    checked={prescriptionVerified}
                    onChange={(e) => setPrescriptionVerified(e.target.checked)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setPrescriptionVerified((prev) => {
                          const nextVal = !prev;
                          if (nextVal) {
                            setTimeout(() => generateBillBtnRef.current?.focus(), 50);
                          }
                          return nextVal;
                        });
                      }
                    }}
                    className="h-4 w-4 text-[#2482ED] focus:ring-2 focus:ring-[#2482ED] border-[#DDE6F0] rounded cursor-pointer"
                  />
                  <label htmlFor="prescriptionVerified" className="text-[13px] font-bold text-orange-600 dark:text-orange-400 cursor-pointer">
                    Prescription Verified (Required)
                  </label>
                </div>
              )}

              <div className="pt-2">
                <Button 
                  ref={generateBillBtnRef}
                  className="w-full text-[15px] font-bold h-12 bg-[#24C9A0] hover:bg-[#1BA885] text-white focus:outline-none focus:ring-2 focus:ring-[#24C9A0] focus:ring-offset-2" 
                  onClick={handleGenerateBill}
                  disabled={isGenerateDisabled}
                  aria-label="Generate Bill (F9)"
                >
                  {isSubmitting ? 'GENERATING...' : 'GENERATE BILL (F9)'}
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* KEYBOARD SHORTCUTS AFFORDANCE (Section 14) */}
      <div 
        className="py-2 px-3 bg-white dark:bg-[#102A43] rounded-xl shadow-xs border border-[#DDE6F0] dark:border-slate-700/50 flex flex-wrap items-center justify-between text-[11px] text-[#64748B] dark:text-slate-400 gap-y-1 gap-x-2 shrink-0 select-none"
        aria-label="Keyboard Shortcuts Bar"
      >
        <div className="flex items-center space-x-1.5 font-bold text-[#162033] dark:text-white">
          <Keyboard className="w-4 h-4 text-[#2482ED]" />
          <span>Shortcuts:</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-[#F5F8FC] dark:bg-slate-800 border border-[#DDE6F0] dark:border-slate-700 rounded text-[#162033] dark:text-slate-200 shadow-xs">F2</kbd>
            <span>Search Medicine</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-[#F5F8FC] dark:bg-slate-800 border border-[#DDE6F0] dark:border-slate-700 rounded text-[#162033] dark:text-slate-200 shadow-xs">F3</kbd>
            <span>Customer</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-[#F5F8FC] dark:bg-slate-800 border border-[#DDE6F0] dark:border-slate-700 rounded text-[#162033] dark:text-slate-200 shadow-xs">F4</kbd>
            <span>Payment</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-[#F5F8FC] dark:bg-slate-800 border border-[#DDE6F0] dark:border-slate-700 rounded text-[#162033] dark:text-slate-200 shadow-xs">F6</kbd>
            <span>Quantity</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-[#F5F8FC] dark:bg-slate-800 border border-[#DDE6F0] dark:border-slate-700 rounded text-[#162033] dark:text-slate-200 shadow-xs">F8</kbd>
            <span>Discount</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-[#F5F8FC] dark:bg-slate-800 border border-[#DDE6F0] dark:border-slate-700 rounded text-[#162033] dark:text-slate-200 shadow-xs">F9</kbd>
            <span>Generate Bill</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-[#F5F8FC] dark:bg-slate-800 border border-[#DDE6F0] dark:border-slate-700 rounded text-[#162033] dark:text-slate-200 shadow-xs">Enter</kbd>
            <span>Select / Confirm</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-[#F5F8FC] dark:bg-slate-800 border border-[#DDE6F0] dark:border-slate-700 rounded text-[#162033] dark:text-slate-200 shadow-xs">Esc</kbd>
            <span>Close</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-[#F5F8FC] dark:bg-slate-800 border border-[#DDE6F0] dark:border-slate-700 rounded text-[#162033] dark:text-slate-200 shadow-xs">↑ ↓</kbd>
            <span>Navigate</span>
          </span>
        </div>
      </div>

    </div>
  );
};

export default POS;
