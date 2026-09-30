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

/**
 * Calculate cart GST with an overall bill discount applied proportionally.
 * The overall discount is distributed across items based on each item's share
 * of the total net amount (subtotal - item discount), so GST is recalculated
 * on the reduced taxable base per item.
 */
export const calculateCartTaxWithOverallDiscount = (items, overallDiscount) => {
  if (!items || !items.length) return 0;
  const effectiveOverall = Math.max(0, Number(overallDiscount) || 0);
  if (effectiveOverall <= 0) return calculateCartTax(items);

  // Total net amount across all items (subtotal - item discount per item)
  const totalNet = items.reduce((sum, item) => {
    const sub = calculateItemSubtotal(item.quantity, item.rate);
    const disc = calculateItemDiscount(sub, item);
    return sum + Math.max(0, sub - disc);
  }, 0);

  // Cap effective overall discount to total net
  const cappedOverall = Math.min(effectiveOverall, totalNet);
  if (totalNet <= 0) return 0;

  return items.reduce((total, item) => {
    const sub = calculateItemSubtotal(item.quantity, item.rate);
    const disc = calculateItemDiscount(sub, item);
    const itemNet = Math.max(0, sub - disc);
    // Proportional share of overall discount for this item
    const itemOverallShare = totalNet > 0 ? (itemNet / totalNet) * cappedOverall : 0;
    const adjustedTaxable = Math.max(0, itemNet - itemOverallShare);
    return total + calculateTax(adjustedTaxable, item.gst);
  }, 0);
};

/**
 * Calculate grand total incorporating an overall bill discount.
 * overallDiscount is capped so the final total never goes negative.
 */
export const calculateGrandTotalWithOverallDiscount = (items, overallDiscount) => {
  if (!items || !items.length) return 0;
  const subtotal = calculateCartSubtotal(items);
  const itemDiscount = calculateCartDiscount(items);
  const netAfterItemDiscounts = Math.max(0, subtotal - itemDiscount);
  const cappedOverall = Math.min(Math.max(0, Number(overallDiscount) || 0), netAfterItemDiscounts);
  const tax = calculateCartTaxWithOverallDiscount(items, cappedOverall);
  return Math.max(0, subtotal - itemDiscount - cappedOverall + tax);
};

/**
 * Resolve overall discount to a ₹ amount based on type and value.
 * - type 'percentage': value is clamped to [0, 100], applied to net amount (subtotal - item discounts)
 * - type 'amount' (default): value is used directly as ₹ amount
 * The result is always clamped so it never exceeds the net amount.
 */
export const resolveOverallDiscountAmount = (items, discountType, discountValue) => {
  if (!items || !items.length) return 0;
  const val = Math.max(0, Number(discountValue) || 0);
  if (val <= 0) return 0;

  const subtotal = calculateCartSubtotal(items);
  const itemDiscount = calculateCartDiscount(items);
  const netAfterItemDiscounts = Math.max(0, subtotal - itemDiscount);

  if (discountType === 'percentage') {
    const clampedPct = Math.min(val, 100);
    const amount = netAfterItemDiscounts * (clampedPct / 100);
    return Math.min(amount, netAfterItemDiscounts);
  }

  // 'amount' mode — clamp to net
  return Math.min(val, netAfterItemDiscounts);
};

/**
 * Clamp an overall discount so it doesn't exceed the net amount (subtotal - item discounts).
 */
export const clampOverallDiscount = (items, overallDiscount) => {
  if (!items || !items.length) return 0;
  const subtotal = calculateCartSubtotal(items);
  const itemDiscount = calculateCartDiscount(items);
  const netAfterItemDiscounts = Math.max(0, subtotal - itemDiscount);
  return Math.min(Math.max(0, Number(overallDiscount) || 0), netAfterItemDiscounts);
};

export const calculateChange = (grandTotal, amountReceived) => {
  if (!amountReceived || amountReceived < grandTotal) return 0;
  return amountReceived - grandTotal;
};
