import { calculateTax } from './taxCalculations';

export const calculateItemSubtotal = (quantity, rate) => {
  return (quantity || 0) * (rate || 0);
};

export const calculateItemDiscount = (subtotal, discountObjOrPercentage) => {
  if (typeof discountObjOrPercentage === 'object' && discountObjOrPercentage !== null) {
    const d = discountObjOrPercentage;
    if (d.discountType === 'fixed') {
      return Math.min(subtotal, d.discountValue || 0);
    }
    // percentage or manual
    let calc = subtotal * ((d.discountValue ?? d.discount ?? 0) / 100);
    if (d.maxDiscountAmount && d.maxDiscountAmount > 0) {
      calc = Math.min(calc, d.maxDiscountAmount);
    }
    return Math.min(subtotal, calc);
  }

  // legacy numeric
  const p = Number(discountObjOrPercentage) || 0;
  if (p <= 0) return 0;
  if (p > 100) return subtotal;
  return subtotal * (p / 100);
};

export const calculateItemAmount = (quantity, rate, discountObjOrPercentage, gstPercentage) => {
  const subtotal = calculateItemSubtotal(quantity, rate);
  const discount = calculateItemDiscount(subtotal, discountObjOrPercentage);
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = calculateTax(taxableAmount, gstPercentage);
  return taxableAmount + tax;
};

export const calculateCartSubtotal = (items) => {
  if (!items || !items.length) return 0;
  return items.reduce((total, item) => total + calculateItemSubtotal(item.quantity, item.rate), 0);
};

export const calculateCartDiscount = (items) => {
  if (!items || !items.length) return 0;
  return items.reduce((total, item) => {
    const subtotal = calculateItemSubtotal(item.quantity, item.rate);
    return total + calculateItemDiscount(subtotal, item);
  }, 0);
};

export const calculateCartTax = (items) => {
  if (!items || !items.length) return 0;
  return items.reduce((total, item) => {
    const subtotal = calculateItemSubtotal(item.quantity, item.rate);
    const discount = calculateItemDiscount(subtotal, item);
    return total + calculateTax(Math.max(0, subtotal - discount), item.gst);
  }, 0);
};

export const calculateGrandTotal = (subtotal, discount, tax) => {
  return Math.max(0, (subtotal || 0) - (discount || 0) + (tax || 0));
};

export const calculateChange = (grandTotal, amountReceived) => {
  if (!amountReceived || amountReceived < grandTotal) return 0;
  return amountReceived - grandTotal;
};
