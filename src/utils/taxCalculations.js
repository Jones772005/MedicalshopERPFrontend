export const calculateTax = (taxableAmount, gstPercentage) => {
  if (!taxableAmount || taxableAmount < 0) return 0;
  if (!gstPercentage || gstPercentage < 0) return 0;
  
  return taxableAmount * (gstPercentage / 100);
};

export const calculateTaxableAmount = (totalAmount, gstPercentage) => {
  // If total is inclusive of tax, calculate base amount
  if (!totalAmount || totalAmount < 0) return 0;
  if (!gstPercentage || gstPercentage < 0) return totalAmount;
  
  return totalAmount / (1 + (gstPercentage / 100));
};
