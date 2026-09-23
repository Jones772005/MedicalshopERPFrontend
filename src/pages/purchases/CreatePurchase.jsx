import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Save, Send } from 'lucide-react';

import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { getSuppliers } from '../../services/supplierApi';
import { getMedicines } from '../../services/medicineApi';
import { createPurchase } from '../../services/purchaseApi';
import { calculateItemAmount } from '../../utils/billingCalculations';

const purchaseSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  expectedDeliveryDate: z.string().min(1, 'Expected delivery date is required'),
  notes: z.string().optional(),
  items: z.array(z.object({
    medicineId: z.string().min(1, 'Medicine is required'),
    quantity: z.number().min(1, 'Quantity must be > 0'),
    purchasePrice: z.number().min(0, 'Invalid price'),
    sellingPrice: z.number().min(0, 'Invalid selling price'),
    mrp: z.number().min(0, 'Invalid MRP'),
    gst: z.number().min(0, 'Invalid GST'),
    discount: z.number().min(0, 'Invalid discount')
  })).min(1, 'At least one item is required')
});

const CreatePurchase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: '',
      items: [{ medicineId: '', quantity: 1, purchasePrice: 0, sellingPrice: 0, mrp: 0, gst: 12, discount: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  // eslint-disable-next-line react/incompatible-library
  const watchItems = watch('items');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supRes, medRes] = await Promise.all([getSuppliers(), getMedicines()]);
        setSuppliers(supRes.data);
        setMedicines(medRes.data);

        if (location.state) {
          if (location.state.supplierId) {
            setValue('supplierId', location.state.supplierId.toString());
          }
          if (location.state.items && location.state.items.length > 0) {
            // Remove the default empty item if we have items to prefill
            remove(0);
            location.state.items.forEach(item => {
              const med = medRes.data.find(m => m.id.toString() === item.medicineId.toString());
              append({
                medicineId: item.medicineId.toString(),
                quantity: item.quantity || 1,
                purchasePrice: med?.purchasePrice || 0,
                sellingPrice: med?.sellingPrice || med?.mrp || 0,
                mrp: med?.mrp || 0,
                gst: med?.gst || 12,
                discount: 0
              });
            });
          }
        }
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMedicineChange = (index, medicineId) => {
    const medicine = medicines.find(m => m.id.toString() === medicineId);
    if (medicine) {
      setValue(`items.${index}.purchasePrice`, medicine.purchasePrice || 0);
      setValue(`items.${index}.sellingPrice`, medicine.sellingPrice || medicine.mrp || 0);
      setValue(`items.${index}.mrp`, medicine.mrp || 0);
      setValue(`items.${index}.gst`, medicine.gst || 12);
    }
  };

  const onSubmit = async (data, status = 'Ordered') => {
    setSubmitting(true);
    try {
      // Calculate totals
      let totalAmount = 0;
      const formattedItems = data.items.map(item => {
        const itemTotal = calculateItemAmount(item.quantity, item.purchasePrice, item.discount, item.gst);
        totalAmount += itemTotal;
        return {
          ...item,
          medicineId: parseInt(item.medicineId),
          purchasePrice: Number(item.purchasePrice),
          sellingPrice: Number(item.sellingPrice),
          mrp: Number(item.mrp),
          gst: Number(item.gst),
          discount: Number(item.discount),
          total: itemTotal
        };
      });

      // Resolve supplier name for denormalized display
      const supplier = suppliers.find(s => s.id.toString() === data.supplierId);
      const purchaseData = {
        supplierId: parseInt(data.supplierId),
        supplierName: supplier?.supplierName || '',
        orderDate: data.orderDate,
        expectedDeliveryDate: data.expectedDeliveryDate,
        notes: data.notes,
        status: status,
        totalAmount: totalAmount,
        tax: data.items.reduce((acc, item) => {
          const sub = Number(item.quantity) * Number(item.purchasePrice);
          const d = sub * (Number(item.discount) / 100);
          return acc + ((sub - d) * (Number(item.gst) / 100));
        }, 0),
        items: formattedItems
      };

      await createPurchase(purchaseData);
      navigate('/purchases');
    } catch (error) {
      console.error('Failed to create purchase:', error);
      // In a real app, show a toast here
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate live summary
  const summary = watchItems.reduce((acc, item) => {
    const q = Number(item.quantity) || 0;
    const p = Number(item.purchasePrice) || 0;
    const d = Number(item.discount) || 0;
    const g = Number(item.gst) || 0;
    
    const subtotal = q * p;
    const discountAmt = subtotal * (d / 100);
    const taxable = subtotal - discountAmt;
    const taxAmt = taxable * (g / 100);
    
    return {
      subtotal: acc.subtotal + subtotal,
      discount: acc.discount + discountAmt,
      tax: acc.tax + taxAmt,
      total: acc.total + taxable + taxAmt
    };
  }, { subtotal: 0, discount: 0, tax: 0, total: 0 });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="New Purchase" 
        description="Create a new purchase order to restock inventory."
      />

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier *</label>
                <select 
                  {...register('supplierId')} 
                  className={`block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${errors.supplierId ? 'border-red-500 focus:ring-red-500' : ''}`}
                >
                  <option value="">Select a supplier...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.supplierName}</option>
                  ))}
                </select>
                {errors.supplierId && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.supplierId.message}</p>}
              </div>
              <Input 
                label="Order Date *" 
                type="date" 
                {...register('orderDate')} 
                error={errors.orderDate?.message}
              />
              <Input 
                label="Expected Delivery Date *" 
                type="date" 
                {...register('expectedDeliveryDate')} 
                error={errors.expectedDeliveryDate?.message}
              />
            </div>
            <Input 
              label="Notes" 
              placeholder="Any special instructions for the supplier..."
              {...register('notes')} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Medicine Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ medicineId: '', quantity: 1, purchasePrice: 0, sellingPrice: 0, mrp: 0, gst: 12, discount: 0 })}>
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Medicine</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase w-24">Qty</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase w-28">Buy (₹)</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase w-28">Sell (₹)</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase w-28">MRP (₹)</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase w-24">Disc %</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase w-24">GST %</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase w-28">Total</th>
                  <th scope="col" className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {fields.map((field, index) => {
                  const q = Number(watchItems[index]?.quantity) || 0;
                  const p = Number(watchItems[index]?.purchasePrice) || 0;
                  const d = Number(watchItems[index]?.discount) || 0;
                  const g = Number(watchItems[index]?.gst) || 0;
                  const itemTotal = calculateItemAmount(q, p, d, g);

                  return (
                    <tr key={field.id} className="hover:bg-gray-50 dark:hover:bg-slate-750/50">
                      <td className="px-4 py-2">
                        <select 
                          {...register(`items.${index}.medicineId`)} 
                          onChange={(e) => {
                            register(`items.${index}.medicineId`).onChange(e);
                            handleMedicineChange(index, e.target.value);
                          }}
                          className={`block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-gray-900 dark:text-slate-100 ${errors.items?.[index]?.medicineId ? 'border-red-500' : ''}`}
                        >
                          <option value="">Select...</option>
                          {medicines.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          min="1"
                          {...register(`items.${index}.quantity`, { valueAsNumber: true })} 
                          className={`block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-gray-900 dark:text-slate-100 ${errors.items?.[index]?.quantity ? 'border-red-500' : ''}`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          step="0.01"
                          min="0"
                          {...register(`items.${index}.purchasePrice`, { valueAsNumber: true })} 
                          className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-gray-900 dark:text-slate-100"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          step="0.01"
                          min="0"
                          placeholder="Sell"
                          {...register(`items.${index}.sellingPrice`, { valueAsNumber: true })} 
                          className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-gray-900 dark:text-slate-100"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          step="0.01"
                          min="0"
                          {...register(`items.${index}.mrp`, { valueAsNumber: true })} 
                          className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-gray-900 dark:text-slate-100"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          {...register(`items.${index}.discount`, { valueAsNumber: true })} 
                          className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-gray-900 dark:text-slate-100"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          {...register(`items.${index}.gst`, { valueAsNumber: true })} 
                          className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-gray-900 dark:text-slate-100"
                        />
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-slate-100">
                        ₹{itemTotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        {fields.length > 1 && (
                          <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {errors.items && <p className="p-4 text-sm text-red-500">{errors.items.message}</p>}
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row gap-6 justify-end">
          <Card className="w-full md:w-80">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span>₹{summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-red-500 dark:text-red-400">
                <span>Discount</span>
                <span>-₹{summary.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-slate-400">
                <span>GST</span>
                <span>+₹{summary.tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                <span>Grand Total</span>
                <span>₹{summary.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-3 border-t border-gray-200 dark:border-slate-700 pt-6">
          <Button type="button" variant="secondary" onClick={() => navigate('/purchases')} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" variant="outline" onClick={handleSubmit((data) => onSubmit(data, 'Draft'))} disabled={submitting}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button type="button" onClick={handleSubmit((data) => onSubmit(data, 'Ordered'))} disabled={submitting}>
            <Send className="w-4 h-4 mr-2" />
            Create Purchase Order
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchase;
