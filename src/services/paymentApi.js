import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { recordAuditEvent } from './auditApi';

export const getPayments = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: localDb.get(KEYS.PAYMENTS) };
};

export const getPaymentById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const payment = localDb.getById(KEYS.PAYMENTS, id);
  if (!payment) throw new Error('Payment not found');
  return { data: payment };
};

export const createPayment = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  // Guard: referenceId must be provided
  const referenceId = data.referenceId;
  if (!referenceId) throw new Error('referenceId is required and must be a valid ID');

  let newPayment = null;

  await localDb.runLocalTransaction(async (tx) => {
    // 1. Insert the new payment first so it is part of the cumulative total
    newPayment = tx.insert(KEYS.PAYMENTS, {
      ...data,
      referenceId: String(referenceId),
      supplierId: data.supplierId ? Number(data.supplierId) : null,
      customerId: data.customerId ? Number(data.customerId) : null,
      amount: Number(data.amount),
      status: data.status || 'Completed'
    });

    // 2. Update the parent entity atomically
    if (data.type === 'Purchase') {
      const purchase = tx.getById(KEYS.PURCHASES, referenceId);
      if (purchase) {
        // Sum ALL payments (including the one just inserted) for this purchase
        const allPayments = tx.get(KEYS.PAYMENTS).filter(
          p => p.type === 'Purchase' && String(p.referenceId) === String(referenceId)
        );
        const cumulativePaid = allPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

        const totalAmount = Number(purchase.totalAmount) || 0;
        let paymentStatus = 'Partial';
        if (cumulativePaid <= 0) paymentStatus = 'Pending';
        else if (cumulativePaid >= totalAmount) paymentStatus = 'Paid';

        tx.update(KEYS.PURCHASES, referenceId, {
          paidAmount: cumulativePaid,
          outstandingAmount: Math.max(0, totalAmount - cumulativePaid),
          paymentStatus
        });
      }
    } else if (data.type === 'Sale') {
      const sale = tx.getById(KEYS.SALES, referenceId);
      if (sale) {
        const allPayments = tx.get(KEYS.PAYMENTS).filter(
          p => p.type === 'Sale' && String(p.referenceId) === String(referenceId)
        );
        const cumulativePaid = allPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

        const totalAmount = Number(sale.totalAmount || sale.grandTotal) || 0;
        const paymentStatus = cumulativePaid >= totalAmount ? 'Paid' : 'Partial';

        tx.update(KEYS.SALES, referenceId, {
          paidAmount: cumulativePaid,
          paymentStatus
        });
      }
    }
  });

  await recordAuditEvent('CREATE', 'Payments', `Recorded payment for ref ${referenceId}`, newPayment?.id);
  return { data: newPayment };
};
