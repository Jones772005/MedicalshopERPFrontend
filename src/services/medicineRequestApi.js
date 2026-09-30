import localDb from './localDb';
import { KEYS } from '../data/storageKeys';


const generateRequestId = () => {
  const requests = localDb.get(KEYS.MEDICINE_REQUESTS) || [];
  const maxId = requests.reduce((max, r) => {
    if (r.id.startsWith('MR-')) {
      const num = parseInt(r.id.split('-')[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);
  return `MR-${String(maxId + 1).padStart(6, '0')}`;
};

export const getMedicineRequests = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const requests = localDb.get(KEYS.MEDICINE_REQUESTS) || [];
      requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      resolve({ data: requests });
    }, 300);
  });
};

export const getMedicineRequestById = async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const requests = localDb.get(KEYS.MEDICINE_REQUESTS) || [];
      const req = requests.find(r => r.id === id);
      if (req) {
        resolve({ data: req });
      } else {
        reject(new Error('Request not found'));
      }
    }, 300);
  });
};

export const createMedicineRequest = async (requestData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const requests = localDb.get(KEYS.MEDICINE_REQUESTS) || [];
      
      const newRequest = {
        ...requestData,
        id: generateRequestId(),
        status: requestData.status || 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      requests.push(newRequest);
      localDb.set(KEYS.MEDICINE_REQUESTS, requests);
      
      resolve({ data: newRequest });
    }, 300);
  });
};

export const updateMedicineRequest = async (id, requestData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const requests = localDb.get(KEYS.MEDICINE_REQUESTS) || [];
      const idx = requests.findIndex(r => r.id === id);
      
      if (idx !== -1) {
        const updatedReq = {
          ...requests[idx],
          ...requestData,
          updatedAt: new Date().toISOString()
        };
        requests[idx] = updatedReq;
        localDb.set(KEYS.MEDICINE_REQUESTS, requests);
        resolve({ data: updatedReq });
      } else {
        reject(new Error('Request not found'));
      }
    }, 300);
  });
};

export const deleteMedicineRequest = async (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const requests = localDb.get(KEYS.MEDICINE_REQUESTS) || [];
      const idx = requests.findIndex(r => r.id === id);
      
      if (idx !== -1) {
        requests.splice(idx, 1);
        localDb.set(KEYS.MEDICINE_REQUESTS, requests);
        resolve({ success: true });
      } else {
        reject(new Error('Request not found'));
      }
    }, 300);
  });
};
