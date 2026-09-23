export const getValidBatches = (inventoryItems, medicineId) => {
  if (!inventoryItems || !medicineId) return [];
  
  const today = new Date();
  
  return inventoryItems
    .filter(item => item.medicineId === medicineId)
    .filter(item => {
      // Must have positive stock
      if (item.quantity <= 0) return false;
      
      // Must not be expired
      if (item.expiryDate) {
        const expiry = new Date(item.expiryDate);
        if (expiry <= today) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // FEFO: Sort by expiry date ascending
      if (!a.expiryDate && !b.expiryDate) return 0;
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });
};

export const getFefoRecommendedBatch = (inventoryItems, medicineId) => {
  const validBatches = getValidBatches(inventoryItems, medicineId);
  return validBatches.length > 0 ? validBatches[0] : null;
};

export const validateQuantityAgainstBatch = (quantity, batch) => {
  if (!batch) return false;
  if (quantity <= 0) return false;
  
  return quantity <= batch.quantity;
};

export const calculateAvailableStock = (inventoryItems, medicineId = null) => {
  if (!inventoryItems) return 0;
  
  let itemsToCount = inventoryItems;
  if (medicineId !== null) {
    itemsToCount = inventoryItems.filter(i => Number(i.medicineId) === Number(medicineId));
  }
  
  return itemsToCount.reduce((total, item) => {
    return total + (Number(item.quantity) || 0);
  }, 0);
};
