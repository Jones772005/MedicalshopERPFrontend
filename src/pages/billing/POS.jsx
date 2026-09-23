import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ShieldAlert, FileText } from 'lucide-react';

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
  calculateCartTax, 
  calculateGrandTotal,
  calculateItemDiscount,
  calculateItemSubtotal
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

  // Prescription Integration
  const [prescriptionVerified, setPrescriptionVerified] = useState(false);
  const cartRequiresPrescription = cartItems.some(item => item.medicine.prescriptionRequired);

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

      setCartItems((prev) => [...prev, newItem]);
    }
    
    setActiveMedicine(null);
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    const updated = [...cartItems];
    const item = updated[index];
    
    if (newQuantity <= 0) return;
    if (newQuantity > item.batch.quantity) {
      // Show toast or alert in real app
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
  };

  const handleClearBill = () => {
    setCartItems([]);
    setCustomer(null);
    setPaymentMethod('Cash');
    setAmountReceived(0);
    setPrescriptionVerified(false);
  };

  const subtotal = calculateCartSubtotal(cartItems);
  const totalDiscount = calculateCartDiscount(cartItems);
  const totalTax = calculateCartTax(cartItems);
  const grandTotal = calculateGrandTotal(subtotal, totalDiscount, totalTax);

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
    <div className="h-[calc(100vh-6rem)] flex flex-col xl:flex-row gap-4">
      
      {/* LEFT COLUMN: Search & Batch Selection (30%) */}
      <div className="w-full xl:w-[30%] flex flex-col space-y-4">
        <div className="bg-white dark:bg-[#102A43] p-4 rounded-xl shadow-sm border border-[#DDE6F0] dark:border-slate-700/50 flex flex-col h-full">
          <h2 className="text-[15px] font-bold text-[#162033] dark:text-white mb-4">Product Search</h2>
          
          <div className="space-y-4">
            <BarcodeInput onBarcodeDetected={(code) => console.log('Barcode scanned:', code)} />
            <div className="relative z-20">
              <ProductSearch onProductSelect={handleProductSelect} />
            </div>
          </div>

          <div className="mt-6 flex-grow border-t border-[#DDE6F0] dark:border-slate-700/50 pt-4 relative z-10">
            {activeMedicine ? (
              <BatchSelector 
                medicine={activeMedicine} 
                onSelect={handleBatchSelect} 
                onCancel={() => setActiveMedicine(null)} 
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
            <Button variant="ghost" size="sm" onClick={handleClearBill} className="text-[#64748B] hover:text-red-500">Clear Bill</Button>
          </div>

          {/* Cart Area */}
          <div className="flex-grow overflow-y-auto bg-white dark:bg-[#102A43]">
            <Cart 
              items={cartItems} 
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
              onUpdateDiscount={handleUpdateDiscount}
            />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Customer, Payment & Checkout (30%) */}
      <div className="w-full xl:w-[30%] flex flex-col">
        <div className="bg-white dark:bg-[#102A43] rounded-xl shadow-sm border border-[#DDE6F0] dark:border-slate-700/50 flex flex-col h-full overflow-hidden">
          
          <div className="flex-grow overflow-y-auto p-5 space-y-6">
            <CustomerSelector onSelect={setCustomer} />
            <PaymentPanel 
              grandTotal={grandTotal} 
              onPaymentMethodChange={setPaymentMethod} 
              onAmountReceivedChange={setAmountReceived} 
            />
          </div>

          {/* Totals & Submit */}
          <div className="border-t border-[#DDE6F0] dark:border-slate-700/50 p-5 bg-[#F5F8FC] dark:bg-slate-800/50 flex flex-col justify-end space-y-3">
            <div className="flex justify-between text-[13px] font-semibold text-[#64748B] dark:text-slate-400">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-semibold text-red-500 dark:text-red-400">
              <span>Discount</span>
              <span>-₹{totalDiscount.toFixed(2)}</span>
            </div>
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
                  type="checkbox" 
                  id="prescriptionVerified" 
                  checked={prescriptionVerified}
                  onChange={(e) => setPrescriptionVerified(e.target.checked)}
                  className="h-4 w-4 text-[#2482ED] focus:ring-[#2482ED] border-[#DDE6F0] rounded"
                />
                <label htmlFor="prescriptionVerified" className="text-[13px] font-bold text-orange-600 dark:text-orange-400">
                  Prescription Verified (Required)
                </label>
              </div>
            )}

            <div className="pt-2">
              <Button 
                className="w-full text-[15px] font-bold h-12 bg-[#24C9A0] hover:bg-[#1BA885] text-white" 
                onClick={handleGenerateBill}
                disabled={isGenerateDisabled}
              >
                {isSubmitting ? 'GENERATING...' : 'GENERATE BILL'}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default POS;
