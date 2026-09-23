import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { recordAuditEvent } from './auditApi';

export const getPrescriptions = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: localDb.get(KEYS.PRESCRIPTIONS) };
};

export const getPrescriptionById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const prescription = localDb.getById(KEYS.PRESCRIPTIONS, id);
  if (!prescription) throw new Error('Prescription not found');
  return { data: prescription };
};

export const createPrescription = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newPrescription = localDb.insert(KEYS.PRESCRIPTIONS, {
    ...data,
    status: 'Pending',
    date: new Date().toISOString()
  });
  
  await recordAuditEvent('CREATE', 'Prescriptions', `Created prescription for ${data.patientName}`, newPrescription.id);
  return { data: newPrescription };
};

export const verifyPrescription = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const updatedPrescription = localDb.update(KEYS.PRESCRIPTIONS, id, { status: 'Verified' });
  await recordAuditEvent('UPDATE', 'Prescriptions', `Verified prescription ${id}`, id);
  return { data: updatedPrescription };
};

export const rejectPrescription = async (id, reason) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const updatedPrescription = localDb.update(KEYS.PRESCRIPTIONS, id, { status: 'Rejected', notes: reason });
  await recordAuditEvent('UPDATE', 'Prescriptions', `Rejected prescription ${id}`, id);
  return { data: updatedPrescription };
};
