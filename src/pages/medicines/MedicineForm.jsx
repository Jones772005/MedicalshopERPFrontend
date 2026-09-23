import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getMedicine, createMedicine, updateMedicine } from '../../services/medicineApi';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

const medicineSchema = z.object({
  name: z.string().min(2, 'Medicine name is required'),
  genericName: z.string().min(2, 'Generic name is required'),
  brandName: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  manufacturingDate: z.string().min(1, 'Required'),
  expiryDate: z.string().min(1, 'Required'),
  purchasePrice: z.coerce.number().min(0, 'Must be positive'),
  sellingPrice: z.coerce.number().min(0, 'Must be positive'),
  mrp: z.coerce.number().min(0, 'Must be positive'),
  gst: z.coerce.number().min(0, 'Must be positive'),
  quantity: z.coerce.number().min(0, 'Must be positive'),
  minimumStockLevel: z.coerce.number().min(0, 'Must be positive'),
  maximumStockLevel: z.coerce.number().min(0, 'Must be positive'),
  rackNumber: z.string().optional(),
  supplierId: z.coerce.number().min(1, 'Supplier is required'),
  prescriptionRequired: z.boolean().default(false),
  barcode: z.string().optional(),
  description: z.string().optional(),
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
      <PageHeader 
        title={isEdit ? "Edit Medicine" : "Add New Medicine"} 
        description="Enter medicine details, pricing, and stock information."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl">
        <Card className="shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
          <CardHeader className="border-b border-[#DDE6F0] dark:border-slate-700/50 bg-[#F5F8FC] dark:bg-slate-900/50 pb-3">
            <CardTitle className="text-[15px] text-[#162033] dark:text-white">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
            <Input label="Medicine Name" error={errors.name?.message} {...register('name')} />
            <Input label="Generic Name" error={errors.genericName?.message} {...register('genericName')} />
            <Input label="Brand Name" error={errors.brandName?.message} {...register('brandName')} />
            <Input label="Category" error={errors.category?.message} {...register('category')} />
            <Input label="Manufacturer" error={errors.manufacturer?.message} {...register('manufacturer')} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
          <CardHeader className="border-b border-[#DDE6F0] dark:border-slate-700/50 bg-[#F5F8FC] dark:bg-slate-900/50 pb-3">
            <CardTitle className="text-[15px] text-[#162033] dark:text-white">Batch & Dates</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
            <Input label="Batch Number" error={errors.batchNumber?.message} {...register('batchNumber')} />
            <Input label="Manufacturing Date" type="date" error={errors.manufacturingDate?.message} {...register('manufacturingDate')} />
            <Input label="Expiry Date" type="date" error={errors.expiryDate?.message} {...register('expiryDate')} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
          <CardHeader className="border-b border-[#DDE6F0] dark:border-slate-700/50 bg-[#F5F8FC] dark:bg-slate-900/50 pb-3">
            <CardTitle className="text-[15px] text-[#162033] dark:text-white">Pricing Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-5">
            <Input label="Purchase Price" type="number" step="0.01" error={errors.purchasePrice?.message} {...register('purchasePrice')} />
            <Input label="Selling Price" type="number" step="0.01" error={errors.sellingPrice?.message} {...register('sellingPrice')} />
            <Input label="MRP" type="number" step="0.01" error={errors.mrp?.message} {...register('mrp')} />
            <Input label="GST (%)" type="number" step="0.01" error={errors.gst?.message} {...register('gst')} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
          <CardHeader className="border-b border-[#DDE6F0] dark:border-slate-700/50 bg-[#F5F8FC] dark:bg-slate-900/50 pb-3">
            <CardTitle className="text-[15px] text-[#162033] dark:text-white">Inventory & Supplier</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
            <Input label="Opening Quantity" type="number" error={errors.quantity?.message} {...register('quantity')} />
            <div>
              <Input label="Low Stock Alert At" type="number" error={errors.minimumStockLevel?.message} {...register('minimumStockLevel')} />
              <p className="text-[11px] font-medium text-[#94A3B8] dark:text-slate-400 mt-1 ml-1 leading-snug">Alert when available stock reaches this quantity or below.</p>
            </div>
            <Input label="Max Stock Level" type="number" error={errors.maximumStockLevel?.message} {...register('maximumStockLevel')} />
            <Input label="Rack Number" error={errors.rackNumber?.message} {...register('rackNumber')} />
            <Input label="Supplier ID" type="number" error={errors.supplierId?.message} {...register('supplierId')} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-[#DDE6F0] dark:border-slate-700/50">
          <CardHeader className="border-b border-[#DDE6F0] dark:border-slate-700/50 bg-[#F5F8FC] dark:bg-slate-900/50 pb-3">
            <CardTitle className="text-[15px] text-[#162033] dark:text-white">Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-5">
            <div className="flex items-center bg-[#F5F8FC] dark:bg-slate-800/50 p-4 rounded-lg border border-[#DDE6F0] dark:border-slate-700/50">
              <input type="checkbox" id="prescription" className="h-4 w-4 text-[#2482ED] focus:ring-[#2482ED] border-[#DDE6F0] dark:border-slate-600 rounded cursor-pointer dark:bg-slate-800" {...register('prescriptionRequired')} />
              <label htmlFor="prescription" className="ml-3 block text-[13px] font-semibold text-[#162033] dark:text-[#EAF3FE] cursor-pointer">Prescription Required</label>
            </div>
            <Input label="Barcode" error={errors.barcode?.message} {...register('barcode')} />
            <div className="w-full">
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
