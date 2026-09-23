import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { 
  getOutOfStockItems, 
  getLowStockItems, 
  getExpiredItems, 
  getNearExpiryItems 
} from './inventoryApi';

export const syncDynamicNotifications = () => {
  const inventory = localDb.get(KEYS.INVENTORY) || [];
  const stored = localDb.get(KEYS.NOTIFICATIONS) || [];
  
  // 1. Generate active dynamic conditions using canonical inventory helpers
  const outOfStock = getOutOfStockItems(inventory);
  const lowStock = getLowStockItems(inventory);
  const expired = getExpiredItems(inventory);
  const nearExpiry = getNearExpiryItems(inventory);

  const currentDynamicAlerts = new Map();

  // Helper to register an alert
  const registerAlert = (id, type, priority, title, message, actionUrl) => {
    currentDynamicAlerts.set(id, { id, type, priority, title, message, actionUrl, module: 'Inventory' });
  };

  outOfStock.forEach(item => {
    registerAlert(
      `out_of_stock:${item.id}`,
      'inventory',
      'critical',
      'Out of Stock Alert',
      `${item.medicineName} (Batch: ${item.batch}) is out of stock (Qty: 0).`,
      '/inventory/out-of-stock'
    );
  });

  lowStock.forEach(item => {
    if (item.quantity > 0) { // low stock but not out of stock
      registerAlert(
        `low_stock:${item.id}`,
        'inventory',
        'high',
        'Low Stock Alert',
        `${item.medicineName} (Batch: ${item.batch}) is running low (Qty: ${item.quantity}).`,
        '/inventory/low-stock'
      );
    }
  });

  expired.forEach(item => {
    registerAlert(
      `expired:${item.id}`,
      'expiry',
      'critical',
      'Expired Stock Alert',
      `${item.medicineName} (Batch: ${item.batch}) has expired.`,
      '/inventory/expiry'
    );
  });

  nearExpiry.forEach(item => {
    const daysLeft = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    registerAlert(
      `near_expiry:${item.id}`,
      'expiry',
      'high',
      'Near Expiry Alert',
      `${item.medicineName} (Batch: ${item.batch}) expires in ${daysLeft} days (Qty: ${item.quantity}).`,
      '/inventory/expiry'
    );
  });

  // 2. Sync with stored notifications
  let updated = false;
  let newStored = [...stored];

  // Remove stale dynamic notifications (conditions no longer met)
  const isDynamic = (id) => id.startsWith('out_of_stock:') || id.startsWith('low_stock:') || id.startsWith('expired:') || id.startsWith('near_expiry:');
  
  const initialLength = newStored.length;
  newStored = newStored.filter(n => !isDynamic(n.id) || currentDynamicAlerts.has(n.id));
  if (newStored.length !== initialLength) updated = true;

  // Add new dynamic notifications
  currentDynamicAlerts.forEach((alert, id) => {
    if (!newStored.some(n => n.id === id)) {
      newStored.push({
        ...alert,
        read: false,
        createdAt: new Date().toISOString()
      });
      updated = true;
    } else {
      // Update the message in case quantities changed, but preserve read state
      const existing = newStored.find(n => n.id === id);
      if (existing.message !== alert.message) {
        existing.message = alert.message;
        updated = true;
      }
    }
  });

  if (updated) {
    localDb.set(KEYS.NOTIFICATIONS, newStored);
  }
};

export const getNotifications = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      syncDynamicNotifications();
      const stored = localDb.get(KEYS.NOTIFICATIONS) || [];
      const sorted = stored.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      resolve({ data: sorted });
    }, 200);
  });
};

export const markNotificationRead = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updated = localDb.update(KEYS.NOTIFICATIONS, id, { read: true });
      resolve({ data: updated });
    }, 100);
  });
};

export const markAllNotificationsRead = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const notifications = localDb.get(KEYS.NOTIFICATIONS);
      notifications.forEach(n => {
        if (!n.read) {
          localDb.update(KEYS.NOTIFICATIONS, n.id, { read: true });
        }
      });
      resolve({ data: { success: true } });
    }, 200);
  });
};
