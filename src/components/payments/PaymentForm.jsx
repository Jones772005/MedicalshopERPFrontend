import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, X } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { getSuppliers } from '../../services/supplierApi';
import { getCustomers } from '../../services/customerApi';
import { createPayment } from '../../services/paymentApi';

const paymentSchema = z.object({
  type: z.enum(['Purchase', 'Sale']),
  supplierId: z.string().optional(),
  customerId: z.string().optional(),
  referenceId: z.string().min(1, 'Invoice/Purchase ID is required'),
  reference: z.string().optional(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  method: z.enum(['Cash', 'UPI', 'Bank Transfer', 'Debit Card', 'Credit Card', 'Other']),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.type === 'Purchase' && !data.supplierId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Supplier is required for Purchase payments',
      path: ['supplierId']
    });
  }
  if (data.type === 'Sale' && !data.customerId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Customer is required for Sale payments',
      path: ['customerId']
    });
  }
});

const PaymentForm = ({ initialData, onSuccess, onCancel }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      type: initialData?.type || 'Purchase',
      supplierId: initialData?.supplierId?.toString() || '',
      customerId: initialData?.customerId?.toString() || '',
      referenceId: initialData?.referenceId?.toString() || '',
      amount: initialData?.amount || 0,
      method: initialData?.method || 'Bank Transfer',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      notes: ''
    }
  });

  // eslint-disable-next-line react/incompatible-library
  const paymentType = watch('type');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supRes, custRes] = await Promise.all([getSuppliers(), getCustomers()]);
        setSuppliers(supRes.data);
        setCustomers(custRes.data);
      } catch (err) {
        console.error('Failed to load contacts:', err);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        supplierId: data.supplierId || null,
        customerId: data.customerId || null,
        referenceId: data.referenceId
      };
      await createPayment(payload);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to create payment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-gray-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Record Payment</h2>
        {onCancel && (
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment For</label>
            <select 
              {...register('type')}
              className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100"
            >
              <option value="Purchase">Purchase Payment (Outgoing to Supplier)</option>
              <option value="Sale">Sales Payment (Incoming from Customer)</option>
            </select>
          </div>

          {paymentType === 'Purchase' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier *</label>
              <select 
                {...register('supplierId')}
                className={`block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 ${errors.supplierId ? 'border-red-500' : ''}`}
              >
                <option value="">Select a supplier...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplierName}</option>)}
              </select>
              {errors.supplierId && <span className="text-xs text-red-500">{errors.supplierId.message}</span>}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer *</label>
              <select 
                {...register('customerId')}
                className={`block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 ${errors.customerId ? 'border-red-500' : ''}`}
              >
                <option value="">Select a customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.customerId && <span className="text-xs text-red-500">{errors.customerId.message}</span>}
            </div>
          )}

          <Input 
            label="PO / Invoice ID *" 
            {...register('referenceId')} 
            error={errors.referenceId?.message}
          />

          <Input 
            label="Payment Date *" 
            type="date"
            {...register('date')} 
            error={errors.date?.message}
          />

          <Input 
            label="Amount (₹) *" 
            type="number"
            step="0.01"
            min="0"
            {...register('amount', { valueAsNumber: true })} 
            error={errors.amount?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
            <select 
              {...register('method')}
              className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <Input 
            label="Transaction Reference" 
            placeholder="UTR / Check No"
            {...register('reference')} 
          />
        </div>

        <Input 
          label="Notes" 
          placeholder="Any additional details..."
          {...register('notes')} 
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-slate-700">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            <Save className="w-4 h-4 mr-2" />
            {submitting ? 'Saving...' : 'Record Payment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
