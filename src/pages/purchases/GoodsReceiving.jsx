import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, ArrowLeft } from 'lucide-react';

import Button from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { getPurchaseById, receivePurchase } from '../../services/purchaseApi';
import { getMedicines } from '../../services/medicineApi';
import { notifyValidationError } from '../../utils/validation';

const receivingSchema = z.object({
  items: z.array(z.object({
    id: z.any().optional(), // PO item id
    medicineId: z.number(),
    orderedQuantity: z.number(),
    receivedQuantity: z.number({ invalid_type_error: 'Received quantity must be a whole number' })
      .int('Received quantity must be a whole number')
      .min(0, 'Received quantity cannot be negative'),
    batchNumber: z.string().optional(),
    rackNumber: z.string().optional(),
    manufacturingDate: z.string().optional(),
    expiryDate: z.string().optional()
  })).superRefine((items, ctx) => {
    items.forEach((item, index) => {
      if (item.receivedQuantity > item.orderedQuantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Received quantity cannot exceed ordered (${item.orderedQuantity})`,
          path: [index, 'receivedQuantity']
        });
      }
      if (item.receivedQuantity > 0) {
        const batch = (item.batchNumber || '').trim();
        if (!batch) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Batch number is required when receiving',
            path: [index, 'batchNumber']
          });
        } else if (batch.length < 2 || batch.length > 30) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Batch number must be between 2 and 30 characters',
            path: [index, 'batchNumber']
          });
        }
        if (!item.expiryDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Expiry date is required when receiving',
            path: [index, 'expiryDate']
          });
        }
        if (item.expiryDate && item.manufacturingDate) {
          if (new Date(item.expiryDate) <= new Date(item.manufacturingDate)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Expiry date must be after manufacturing date',
              path: [index, 'expiryDate']
            });
          }
        }
      }
    });
  })
});

const GoodsReceiving = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(receivingSchema),
    defaultValues: { items: [] }
  });

  const { fields, replace } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [purchaseRes, medicinesRes] = await Promise.all([
          getPurchaseById(id),
          getMedicines()
        ]);
        const p = purchaseRes.data;
        setPurchase(p);
        setMedicines(medicinesRes.data);
        
        // Initialize form with PO items
        const initialItems = p.items.map(item => ({
          id: item.id,
          medicineId: item.medicineId,
          orderedQuantity: item.quantity,
          receivedQuantity: item.quantity, // Default to full receive
          batchNumber: '',
          rackNumber: '',
          manufacturingDate: '',
          expiryDate: ''
        }));
        replace(initialItems);
      } catch (err) {
        console.error('Failed to load purchase for receiving:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, replace]);

  const getMedicineName = (medId) => {
    const m = medicines.find(m => m.id === medId);
    return m ? m.name : 'Unknown Medicine';
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Determine overall status
      let totalOrdered = 0;
      let totalReceived = 0;
      
      data.items.forEach(item => {
        totalOrdered += item.orderedQuantity;
        totalReceived += item.receivedQuantity;
      });

      let newStatus = 'Partially Received';
      if (totalReceived === 0) newStatus = 'Ordered'; // Or Error?
      if (totalReceived >= totalOrdered) newStatus = 'Received';

      // Send to API
      await receivePurchase(id, { 
        status: newStatus,
        receivedItems: data.items.filter(item => item.receivedQuantity > 0)
      });
      
      navigate(`/purchases/${id}`);
    } catch (err) {
      console.error('Failed to receive goods:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!purchase) return <div className="p-8 text-center text-gray-500">Purchase not found.</div>;

  return (
    <div className="space-y-6 w-full pb-12">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(`/purchases/${id}`)} className="p-1.5 h-auto text-[#64748B] hover:text-[#162033] dark:hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="text-xs font-semibold">Back to Purchase Order</span>
          </Button>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2482ED]/10 text-[#2482ED] dark:bg-[#2482ED]/20 dark:text-blue-400 border border-[#2482ED]/20">
            PO #{purchase.purchaseOrderNumber}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, (errs) => notifyValidationError(errs))} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Verify and Receive Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-[#24C9A0] text-white">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Medicine</th>
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider w-24">Ordered</th>
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider w-28">Received</th>
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Batch *</th>
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider w-28">Rack No.</th>
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider w-40">Mfg Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider w-40">Expiry Date *</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#102A43] divide-y divide-[#DDE6F0] dark:divide-slate-700/50">
                {fields.map((field, index) => (
                  <tr key={field.id} className="hover:bg-[#F5F8FC] dark:hover:bg-slate-800/50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[#162033] dark:text-white">
                      <input type="hidden" {...register(`items.${index}.id`, { valueAsNumber: true })} />
                      <input type="hidden" {...register(`items.${index}.medicineId`, { valueAsNumber: true })} />
                      <input type="hidden" {...register(`items.${index}.orderedQuantity`, { valueAsNumber: true })} />
                      {getMedicineName(field.medicineId)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[13px] font-semibold text-[#64748B] dark:text-slate-400">
                      {field.orderedQuantity}
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        min="0"
                        {...register(`items.${index}.receivedQuantity`, { valueAsNumber: true })} 
                        className={`block w-full rounded-md border-[#DDE6F0] dark:border-slate-700 bg-white dark:bg-[#102A43] px-2 py-1.5 text-[13px] text-[#162033] dark:text-white ${errors.items?.[index]?.receivedQuantity ? 'border-red-500' : ''}`}
                      />
                      {errors.items?.[index]?.receivedQuantity && <span className="text-[12px] text-red-500">{errors.items[index].receivedQuantity.message}</span>}
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="text" 
                        placeholder="Batch Number"
                        {...register(`items.${index}.batchNumber`)} 
                        className={`block w-full rounded-md border-[#DDE6F0] dark:border-slate-700 bg-white dark:bg-[#102A43] px-2 py-1.5 text-[13px] text-[#162033] dark:text-white ${errors.items?.[index]?.batchNumber ? 'border-red-500' : ''}`}
                      />
                      {errors.items?.[index]?.batchNumber && <span className="text-[12px] text-red-500">{errors.items[index].batchNumber.message}</span>}
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="text" 
                        placeholder="Rack (e.g. R-03)"
                        {...register(`items.${index}.rackNumber`)} 
                        className={`block w-full rounded-md border-[#DDE6F0] dark:border-slate-700 bg-white dark:bg-[#102A43] px-2 py-1.5 text-[13px] text-[#162033] dark:text-white`}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="date" 
                        {...register(`items.${index}.manufacturingDate`)} 
                        className="block w-full rounded-md border-[#DDE6F0] dark:border-slate-700 bg-white dark:bg-[#102A43] px-2 py-1.5 text-[13px] text-[#162033] dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="date" 
                        {...register(`items.${index}.expiryDate`)} 
                        className={`block w-full rounded-md border-[#DDE6F0] dark:border-slate-700 bg-white dark:bg-[#102A43] px-2 py-1.5 text-[13px] text-[#162033] dark:text-white ${errors.items?.[index]?.expiryDate ? 'border-red-500' : ''}`}
                      />
                      {errors.items?.[index]?.expiryDate && <span className="text-[12px] text-red-500">{errors.items[index].expiryDate.message}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={() => navigate(`/purchases/${id}`)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            <Save className="w-4 h-4 mr-2" />
            {submitting ? 'Receiving...' : 'Confirm Goods Received'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GoodsReceiving;
