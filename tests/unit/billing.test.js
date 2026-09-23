import { describe, it, expect } from 'vitest';
import { calculateCartSubtotal, calculateCartDiscount, calculateCartTax, calculateGrandTotal, calculateChange } from '../../src/utils/billingCalculations';

describe('Billing Calculations', () => {
  const items = [
    { rate: 100, quantity: 2, discount: 10, gst: 5 }, // subtotal: 200, discount: 20, tax: 9 (180 * 5%)
    { rate: 50, quantity: 4, discount: 0, gst: 12 },  // subtotal: 200, discount: 0, tax: 24 (200 * 12%)
  ];

  it('calculates cart subtotal correctly', () => {
    // 200 + 200 = 400
    expect(calculateCartSubtotal(items)).toBe(400);
  });

  it('calculates cart discount correctly', () => {
    // 20 + 0 = 20
    expect(calculateCartDiscount(items)).toBe(20);
  });

  it('calculates cart tax correctly', () => {
    // 9 + 24 = 33
    expect(calculateCartTax(items)).toBe(33);
  });

  it('calculates grand total correctly', () => {
    // 400 - 20 + 33 = 413
    expect(calculateGrandTotal(400, 20, 33)).toBe(413);
  });

  it('calculates change correctly', () => {
    expect(calculateChange(413, 500)).toBe(87);
    expect(calculateChange(413, 400)).toBe(0); // If less than total, returns 0
  });
});
