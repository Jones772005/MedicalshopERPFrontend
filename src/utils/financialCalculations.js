// Centralized financial calculations for true data reporting

export const calculateCOGS = (saleItems, inventoryBatches) => {
  // Cost of Goods Sold = sum(quantity * originalPurchasePrice)
  // saleItems might only have MRP or selling rate.
  // The true profit requires knowing the purchase price of the items sold.
  if (!saleItems || !saleItems.length) return 0;

  return saleItems.reduce((total, item) => {
    // If saleItem already captured purchasePrice at time of sale (ideal), use it
    if (item.purchasePrice) {
      return total + (item.quantity * item.purchasePrice);
    }
    
    // Fallback: look up in inventory batches if possible, otherwise guess 0
    if (inventoryBatches) {
      const batch = inventoryBatches.find(b => b.medicineId === item.medicineId && b.batch === item.batchNumber);
      if (batch && batch.purchasePrice) {
        return total + (item.quantity * batch.purchasePrice);
      }
    }
    
    return total; // 0 if unknown
  }, 0);
};

export const calculateProfit = (sales, inventoryBatches = null) => {
  if (!sales || !sales.length) return 0;

  return sales.reduce((totalProfit, sale) => {
    const saleRevenue = (sale.subtotal || 0) - (sale.discount || 0); // Excluding tax from revenue
    const saleCOGS = calculateCOGS(sale.items, inventoryBatches);
    
    return totalProfit + (saleRevenue - saleCOGS);
  }, 0);
};

export const calculateTaxes = (sales, purchases, salesReturns = [], purchaseReturns = []) => {
  // Output Tax (Sales GST)
  const salesGst = sales.reduce((acc, sale) => acc + (sale.tax || 0), 0);
  
  // Output Tax Adjustment (Sales Returns)
  const salesReturnGst = salesReturns.reduce((acc, ret) => acc + (ret.tax || 0), 0);
  
  const netOutputTax = salesGst - salesReturnGst;

  // Input Tax (Purchases GST)
  const purchaseGst = purchases.reduce((acc, po) => acc + (po.tax || 0), 0);
  
  // Input Tax Adjustment (Purchase Returns)
  const purchaseReturnGst = purchaseReturns.reduce((acc, ret) => acc + (ret.tax || 0), 0);
  
  const netInputTax = purchaseGst - purchaseReturnGst;

  // Tax Payable = Output Tax - Input Tax (Input Tax Credit)
  const netTaxPayable = netOutputTax - netInputTax;

  return {
    salesGst,
    salesReturnGst,
    netOutputTax,
    purchaseGst,
    purchaseReturnGst,
    netInputTax,
    netTaxPayable
  };
};
