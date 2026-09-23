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

const receivingSchema = z.object({
  items: z.array(z.object({
    id: z.any().optional(), // PO item id
    medicineId: z.number(),
    orderedQuantity: z.number(),
    receivedQuantity: z.number().min(0, 'Cannot be negative'),
    batchNumber: z.string().optional(),
    rackNumber: z.string().optional(),
    manufacturingDate: z.string().optional(),
    expiryDate: z.string().optional()
  })).superRefine((items, ctx) => {
    items.forEach((item, index) => {
      if (item.receivedQuantity > 0) {
        if (!item.batchNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Batch is required when receiving',
            path: [index, 'batchNumber']
          });
        }
        if (!item.expiryDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Expiry is required when receiving',
            path: [index, 'expiryDate']
          });
        }
        if (item.expiryDate && item.manufacturingDate) {
          if (new Date(item.expiryDate) <= new Date(item.manufacturingDate)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Expiry must be after Mfg Date',
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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="ghost" onClick={() => navigate(`/purchases/${id}`)} className="p-2">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Receive Goods</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Purchase Order: {purchase.purchaseOrderNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Verify and Receive Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Medicine</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase w-24">Ordered</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase w-28">Received</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Batch *</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase w-28">Rack No.</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase w-40">Mfg Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase w-40">Expiry Date *</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {fields.map((field, index) => (
                  <tr key={field.id} className="hover:bg-gray-50 dark:hover:bg-slate-750/50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
                      <input type="hidden" {...register(`items.${index}.id`, { valueAsNumber: true })} />
                      <input type="hidden" {...register(`items.${index}.medicineId`, { valueAsNumber: true })} />
                      <input type="hidden" {...register(`items.${index}.orderedQuantity`, { valueAsNumber: true })} />
                      {getMedicineName(field.medicineId)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      {field.orderedQuantity}
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        min="0"
                        {...register(`items.${index}.receivedQuantity`, { valueAsNumber: true })} 
                        className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-gray-900 dark:text-slate-100"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="text" 
                        placeholder="Batch Number"
                        {...register(`items.${index}.batchNumber`)} 
                        className={`block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-gray-900 dark:text-slate-100 ${errors.items?.[index]?.batchNumber ? 'border-red-500' : ''}`}
                      />
                      {errors.items?.[index]?.batchNumber && <span className="text-xs text-red-500">{errors.items[index].batchNumber.message}</span>}
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="text" 
                        placeholder="Rack (e.g. R-03)"
                        {...register(`items.${index}.rackNumber`)} 
                        className={`block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-gray-900 dark:text-slate-100`}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="date" 
                        {...register(`items.${index}.manufacturingDate`)} 
                        className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-gray-900 dark:text-slate-100"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="date" 
                        {...register(`items.${index}.expiryDate`)} 
                        className={`block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-gray-900 dark:text-slate-100 ${errors.items?.[index]?.expiryDate ? 'border-red-500' : ''}`}
                      />
                      {errors.items?.[index]?.expiryDate && <span className="text-xs text-red-500">{errors.items[index].expiryDate.message}</span>}
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
