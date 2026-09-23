import { KEYS } from '../data/storageKeys';

// Event emitter for cross-component reactivity
export const emitDbChange = (key) => {
  window.dispatchEvent(new CustomEvent('medishop-db-change', { detail: { key } }));
};

const localDb = {
  get: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading ${key} from LocalStorage`, e);
      return [];
    }
  },

  getById: (key, id) => {
    const data = localDb.get(key);
    return data.find((item) => item.id === id || item.id === Number(id) || item.id === String(id));
  },

  set: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      emitDbChange(key);
    } catch (e) {
      console.error(`Error writing ${key} to LocalStorage`, e);
    }
  },

  insert: (key, item) => {
    const data = localDb.get(key);
    const counters = localDb.get(KEYS.COUNTERS) || {};
    
    // Auto-increment ID strategy if ID isn't provided
    if (!item.id) {
      const prefix = getPrefixForKey(key);
      const nextIdNum = (counters[key] || data.length) + 1;
      counters[key] = nextIdNum;
      localDb.set(KEYS.COUNTERS, counters);
      
      // We'll use either string prefix IDs (e.g. MED-0001) or simple numbers if existing code relies on numbers.
      // Many existing tables use numeric IDs. For safety with existing code, if prefix is empty, use numbers.
      item.id = prefix ? `${prefix}-${String(nextIdNum).padStart(6, '0')}` : nextIdNum;
    }

    const newItem = {
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.push(newItem);
    localDb.set(key, data);
    return newItem;
  },

  update: (key, id, updates) => {
    const data = localDb.get(key);
    const index = data.findIndex((item) => item.id === id || item.id === Number(id) || item.id === String(id));
    
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in ${key}`);
    }

    data[index] = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localDb.set(key, data);
    return data[index];
  },

  remove: (key, id) => {
    const data = localDb.get(key);
    const index = data.findIndex((item) => item.id === id || item.id === Number(id) || item.id === String(id));
    
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in ${key}`);
    }

    const removedItem = data[index];
    data.splice(index, 1);
    localDb.set(key, data);
    return removedItem;
  },

  // Simulate an atomic transaction (e.g., for POS)
  // Provide a callback that receives a transaction object: { get, insert, update, remove }
  // All mutations within the callback operate on an in-memory copy of the entire DB.
  // If the callback succeeds, the entire DB state is written back to LocalStorage at once.
  // If it throws an error, nothing is written (rollback).
  runLocalTransaction: async (callback) => {
    // 1. Snapshot entire DB state
    const snapshot = {};
    for (const key of Object.values(KEYS)) {
      snapshot[key] = localDb.get(key);
    }
    const txState = JSON.parse(JSON.stringify(snapshot)); // Deep copy

    // Transaction mutators
    const tx = {
      get: (key) => txState[key] || [],
      getById: (key, id) => (txState[key] || []).find((item) => item.id === id || item.id === Number(id) || item.id === String(id)),
      insert: (key, item) => {
        if (!txState[key]) txState[key] = [];
        
        const counters = txState[KEYS.COUNTERS] || {};
        if (!item.id) {
          const prefix = getPrefixForKey(key);
          const nextIdNum = (counters[key] || txState[key].length) + 1;
          counters[key] = nextIdNum;
          txState[KEYS.COUNTERS] = counters;
          item.id = prefix ? `${prefix}-${String(nextIdNum).padStart(6, '0')}` : nextIdNum;
        }

        const newItem = {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        txState[key].push(newItem);
        return newItem;
      },
      update: (key, id, updates) => {
        if (!txState[key]) txState[key] = [];
        const index = txState[key].findIndex((item) => item.id === id || item.id === Number(id) || item.id === String(id));
        if (index === -1) throw new Error(`Item ${id} not found in ${key}`);
        
        txState[key][index] = {
          ...txState[key][index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        return txState[key][index];
      },
      remove: (key, id) => {
         if (!txState[key]) txState[key] = [];
         const index = txState[key].findIndex((item) => item.id === id || item.id === Number(id) || item.id === String(id));
         if (index === -1) throw new Error(`Item ${id} not found in ${key}`);
         const removedItem = txState[key][index];
         txState[key].splice(index, 1);
         return removedItem;
      }
    };

    try {
      // 2. Execute business logic
      await callback(tx);
      
      // 3. Commit changes (write modified keys back to LocalStorage)
      const changedKeys = [];
      for (const key of Object.keys(txState)) {
        if (JSON.stringify(snapshot[key]) !== JSON.stringify(txState[key])) {
          localStorage.setItem(key, JSON.stringify(txState[key]));
          changedKeys.push(key);
        }
      }
      
      // Emit changes for UI refresh
      changedKeys.forEach(key => emitDbChange(key));
      return true;
    } catch (error) {
      console.error('Transaction failed, rolling back.', error);
      throw error;
    }
  },

  resetDemoData: () => {
    const keysToClear = [
      KEYS.MEDICINES,
      KEYS.ALTERNATIVES,
      KEYS.BATCHES,
      KEYS.INVENTORY,
      KEYS.INVENTORY_TRANSACTIONS,
      KEYS.SUPPLIERS,
      KEYS.PURCHASES,
      KEYS.PURCHASE_RETURNS,
      KEYS.CUSTOMERS,
      KEYS.SALES,
      KEYS.SALES_RETURNS,
      KEYS.PAYMENTS,
      KEYS.PRESCRIPTIONS,
      KEYS.NOTIFICATIONS,
      KEYS.AUDIT_LOGS,
      KEYS.CAMPAIGNS,
      KEYS.QR,
      KEYS.DISCOUNTS
    ];

    keysToClear.forEach(key => {
      localStorage.setItem(key, JSON.stringify([]));
    });

    // Reset counters
    localStorage.setItem(KEYS.COUNTERS, JSON.stringify({}));

    // Emit changes so UI updates immediately
    keysToClear.forEach(key => emitDbChange(key));
    
    return true;
  }
};

// Map keys to string prefixes if desired. 
// For compatibility with Phase 1-5, returning empty string means we use numeric IDs.
// Some entities (like purchases, sales) may benefit from prefixed strings.
function getPrefixForKey(key) {
  switch(key) {
    case KEYS.PURCHASES: return 'PUR';
    case KEYS.SALES: return 'INV';
    case KEYS.PAYMENTS: return 'PAY';
    case KEYS.SALES_RETURNS: return 'SR';
    case KEYS.PURCHASE_RETURNS: return 'PR';
    case KEYS.INVENTORY_TRANSACTIONS: return 'TXN';
    case KEYS.DISCOUNTS: return 'DISC';
    default: return ''; // numeric
  }
}

export default localDb;
