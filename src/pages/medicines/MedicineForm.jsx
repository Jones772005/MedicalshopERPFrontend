import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft } from 'lucide-react';
import { getMedicine, createMedicine, updateMedicine } from '../../services/medicineApi';
import { notifyValidationError } from '../../utils/validation';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

const medicineSchema = z.object({
  name: z.string().trim().min(2, 'Medicine name must be at least 2 characters').max(100, 'Medicine name cannot exceed 100 characters'),
  genericName: z.string().trim().min(2, 'Generic name must be at least 2 characters').max(100, 'Generic name cannot exceed 100 characters'),
  brandName: z.string().trim().max(100, 'Brand name cannot exceed 100 characters').optional().or(z.literal('')),
  category: z.string().trim().min(2, 'Category must be at least 2 characters').max(50, 'Category cannot exceed 50 characters'),
  manufacturer: z.string().trim().min(2, 'Manufacturer must be at least 2 characters').max(100, 'Manufacturer cannot exceed 100 characters'),
  batchNumber: z.string().trim().min(2, 'Batch number must be at least 2 characters').max(30, 'Batch number cannot exceed 30 characters'),
  manufacturingDate: z.string().min(1, 'Manufacturing date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  purchasePrice: z.coerce.number({ invalid_type_error: 'Valid purchase price is required' })
    .min(0, 'Purchase price cannot be negative')
    .refine(val => /^\d+(\.\d{1,2})?$/.test(String(val)), 'Purchase price can have at most 2 decimal places'),
  sellingPrice: z.coerce.number({ invalid_type_error: 'Valid selling price is required' })
    .min(0, 'Selling price cannot be negative')
    .refine(val => /^\d+(\.\d{1,2})?$/.test(String(val)), 'Selling price can have at most 2 decimal places'),
  mrp: z.coerce.number({ invalid_type_error: 'Valid MRP is required' })
    .min(0, 'MRP cannot be negative')
    .refine(val => /^\d+(\.\d{1,2})?$/.test(String(val)), 'MRP can have at most 2 decimal places'),
  gst: z.coerce.number({ invalid_type_error: 'Valid GST is required' })
    .min(0, 'GST cannot be negative')
    .max(100, 'GST cannot exceed 100%'),
  quantity: z.coerce.number({ invalid_type_error: 'Valid quantity is required' })
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative'),
  minimumStockLevel: z.coerce.number({ invalid_type_error: 'Valid minimum stock level is required' })
    .int('Minimum stock level must be a whole number')
    .min(0, 'Minimum stock cannot be negative'),
  maximumStockLevel: z.coerce.number({ invalid_type_error: 'Valid maximum stock level is required' })
    .int('Maximum stock level must be a whole number')
    .min(0, 'Maximum stock cannot be negative'),
  rackNumber: z.string().trim().max(20, 'Rack number cannot exceed 20 characters').optional().or(z.literal('')),
  supplierId: z.coerce.number({ invalid_type_error: 'Valid supplier ID is required' }).min(1, 'Supplier is required'),
  prescriptionRequired: z.boolean().default(false),
  barcode: z.string().trim().regex(/^[A-Za-z0-9-]{4,20}$/, 'Barcode must be 4 to 20 alphanumeric characters').optional().or(z.literal('')),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.manufacturingDate && data.expiryDate) {
    if (new Date(data.expiryDate) < new Date(data.manufacturingDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Expiry date must be on or after manufacturing date',
        path: ['expiryDate']
      });
    }
  }
  if (data.sellingPrice > data.mrp) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selling price cannot exceed Maximum Retail Price (MRP)',
      path: ['sellingPrice']
    });
  }
  if (data.maximumStockLevel < data.minimumStockLevel) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Maximum stock level cannot be less than low stock alert level',
      path: ['maximumStockLevel']
    });
  }
});

const MedicineForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(medicineSchema),
    defaultValues: { prescriptionRequired: false }
  });

  useEffect(() => {
    if (isEdit) {
      const fetchMed = async () => {
        try {
          const res = await getMedicine(id);
          reset(res.data);
        } catch (error) {
          console.error(error);
          navigate('/medicines');
        } finally {
          setLoading(false);
        }
      };
      fetchMed();
    }
  }, [id, isEdit, reset, navigate]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateMedicine(id, data);
      } else {
        await createMedicine(data);
      }
      navigate('/medicines');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2482ED]"></div></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => navigate('/medicines')} className="inline-flex items-center text-xs text-[#64748B] hover:text-[#162033] dark:hover:text-white p-0 h-auto">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Medicines
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit, (errs) => notifyValidationError(errs))} className="space-y-6 w-full">
        <Card className="shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
          <CardHeader className="border-b border-[#DDE6F0] dark:border-slate-700/50 bg-[#F5F8FC] dark:bg-slate-900/50 pb-3">
            <CardTitle className="text-[15px] text-[#162033] dark:text-white">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
            <Input label="Medicine Name" required error={errors.name?.message} {...register('name')} />
            <Input label="Generic Name" required error={errors.genericName?.message} {...register('genericName')} />
            <Input label="Brand Name" error={errors.brandName?.message} {...register('brandName')} />
            <Input label="Category" required error={errors.category?.message} {...register('category')} />
            <Input label="Manufacturer" required error={errors.manufacturer?.message} {...register('manufacturer')} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
          <CardHeader className="border-b border-[#DDE6F0] dark:border-slate-700/50 bg-[#F5F8FC] dark:bg-slate-900/50 pb-3">
            <CardTitle className="text-[15px] text-[#162033] dark:text-white">Batch & Dates</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
            <Input label="Batch Number" required error={errors.batchNumber?.message} {...register('batchNumber')} />
            <Input label="Manufacturing Date" type="date" required error={errors.manufacturingDate?.message} {...register('manufacturingDate')} />
            <Input label="Expiry Date" type="date" required error={errors.expiryDate?.message} {...register('expiryDate')} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
          <CardHeader className="border-b border-[#DDE6F0] dark:border-slate-700/50 bg-[#F5F8FC] dark:bg-slate-900/50 pb-3">
            <CardTitle className="text-[15px] text-[#162033] dark:text-white">Pricing Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-5">
            <Input label="Purchase Price" type="number" step="0.01" required error={errors.purchasePrice?.message} {...register('purchasePrice')} />
            <Input label="Selling Price" type="number" step="0.01" required error={errors.sellingPrice?.message} {...register('sellingPrice')} />
            <Input label="MRP" type="number" step="0.01" required error={errors.mrp?.message} {...register('mrp')} />
            <Input label="GST (%)" type="number" step="0.01" required error={errors.gst?.message} {...register('gst')} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
          <CardHeader className="border-b border-[#DDE6F0] dark:border-slate-700/50 bg-[#F5F8FC] dark:bg-slate-900/50 pb-3">
            <CardTitle className="text-[15px] text-[#162033] dark:text-white">Inventory & Supplier</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-5">
            <Input label="Opening Quantity" type="number" required error={errors.quantity?.message} {...register('quantity')} />
            <div>
              <Input label="Low Stock Alert At" type="number" required error={errors.minimumStockLevel?.message} {...register('minimumStockLevel')} />
              <p className="text-[11px] font-medium text-[#94A3B8] dark:text-slate-400 mt-1 ml-1 leading-snug">Alert when available stock reaches this quantity or below.</p>
            </div>
            <Input label="Max Stock Level" type="number" required error={errors.maximumStockLevel?.message} {...register('maximumStockLevel')} />
            <Input label="Rack Number" error={errors.rackNumber?.message} {...register('rackNumber')} />
            <Input label="Supplier ID" type="number" required error={errors.supplierId?.message} {...register('supplierId')} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
          <CardHeader className="border-b border-[#DDE6F0] dark:border-slate-700/50 bg-[#F5F8FC] dark:bg-slate-900/50 pb-3">
            <CardTitle className="text-[15px] text-[#162033] dark:text-white">Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
            <div className="flex flex-col justify-end">
              <div className="flex items-center bg-[#F5F8FC] dark:bg-slate-800/50 px-4 h-[42px] rounded-lg border border-[#DDE6F0] dark:border-slate-700/50">
                <input type="checkbox" id="prescription" className="h-4 w-4 text-[#2482ED] focus:ring-[#2482ED] border-[#DDE6F0] dark:border-slate-600 rounded cursor-pointer dark:bg-slate-800" {...register('prescriptionRequired')} />
                <label htmlFor="prescription" className="ml-3 block text-[13px] font-semibold text-[#162033] dark:text-[#EAF3FE] cursor-pointer">Prescription Required</label>
              </div>
            </div>
            <Input label="Barcode" error={errors.barcode?.message} {...register('barcode')} />
            <div className="col-span-full">
              <label className="block text-[13px] font-semibold text-[#162033] dark:text-[#EAF3FE] mb-1.5">Description</label>
              <textarea 
                className="flex w-full rounded-lg border border-[#DDE6F0] dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-[13px] text-[#162033] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2482ED] focus:border-transparent transition-shadow" 
                rows="3"
                {...register('description')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/medicines')}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Save Medicine</Button>
        </div>
      </form>
    </div>
  );
};

export default MedicineForm;
