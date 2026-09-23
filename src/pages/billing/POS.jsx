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
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
      
      {/* LEFT COLUMN: Search & Batch Selection */}
      <div className="w-full md:w-1/3 flex flex-col space-y-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col h-full">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Product Search</h2>
          
          <div className="space-y-4">
            <BarcodeInput onBarcodeDetected={(code) => console.log('Barcode scanned:', code)} />
            <div className="relative z-20">
              <ProductSearch onProductSelect={handleProductSelect} />
            </div>
          </div>

          <div className="mt-6 flex-grow border-t border-gray-200 dark:border-slate-700 pt-4 relative z-10">
            {activeMedicine ? (
              <BatchSelector 
                medicine={activeMedicine} 
                onSelect={handleBatchSelect} 
                onCancel={() => setActiveMedicine(null)} 
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm">Search for a product to begin billing</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Cart & Checkout */}
      <div className="w-full md:w-2/3 flex flex-col">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col h-full overflow-hidden">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Current Bill</h2>
            <div className="space-x-2">
              <Button variant="ghost" size="sm" onClick={handleClearBill}>Clear Bill</Button>
            </div>
          </div>

          {/* Cart Area */}
          <div className="flex-grow overflow-y-auto">
            <Cart 
              items={cartItems} 
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
              onUpdateDiscount={handleUpdateDiscount}
            />
          </div>

          {/* Footer Area / Payment */}
          <div className="border-t border-gray-200 dark:border-slate-700 p-6 bg-gray-50 dark:bg-slate-900/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Payment Settings */}
              <div>
                <CustomerSelector onSelect={setCustomer} />
                <PaymentPanel 
                  grandTotal={grandTotal} 
                  onPaymentMethodChange={setPaymentMethod} 
                  onAmountReceivedChange={setAmountReceived} 
                />
              </div>

              {/* Totals & Submit */}
              <div className="flex flex-col justify-end space-y-3">
                <div className="flex justify-between text-sm text-gray-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-red-500 dark:text-red-400">
                  <span>Discount</span>
                  <span>-₹{totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 dark:text-slate-400">
                  <span>GST</span>
                  <span>+₹{totalTax.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-gray-300 dark:border-slate-600 flex justify-between font-bold text-2xl text-gray-900 dark:text-white">
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
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="prescriptionVerified" className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      Prescription Verified (Required)
                    </label>
                  </div>
                )}

                <div className="pt-2">
                  <Button 
                    className="w-full text-lg h-14" 
                    onClick={handleGenerateBill}
                    disabled={isGenerateDisabled}
                  >
                    {isSubmitting ? 'Generating...' : 'GENERATE BILL'}
                  </Button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default POS;
