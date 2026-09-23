import { describe, it, expect } from 'vitest';
import { calculateTax, calculateTaxableAmount } from '../../src/utils/taxCalculations';

describe('Tax Calculations', () => {
  it('calculates tax correctly', () => {
    // taxableAmount = 200, gstPercentage = 5% => 10
    expect(calculateTax(200, 5)).toBe(10);
    // taxableAmount = 100.50, gstPercentage = 12% => 12.06
    expect(calculateTax(100.50, 12)).toBeCloseTo(12.06);
  });

  it('calculates taxable amount (reverse) correctly', () => {
    // totalAmount = 112, gstPercentage = 12% => 100
    expect(calculateTaxableAmount(112, 12)).toBeCloseTo(100);
  });
});
