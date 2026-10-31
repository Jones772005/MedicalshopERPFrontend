import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { createSupplier, updateSupplier, getSupplierById } from '../../services/supplierApi';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

const supplierSchema = z.object({
  supplierName: z.string().trim().min(2, 'Supplier Name is required'),
  companyName: z.string().trim().min(2, 'Company Name is required'),
  contactPerson: z.string().trim().min(2, 'Contact Person is required'),
  phoneNumber: z.string().trim().min(7, 'Phone number must be at least 7 digits').regex(/^[0-9+\-\s()]+$/, 'Valid phone number is required'),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().trim().optional(),
  gstNumber: z.string().trim().optional(),
  paymentTerms: z.string().trim().optional(),
});

const SupplierForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(supplierSchema)
  });

  useEffect(() => {
    if (isEdit) {
      const fetchSupplier = async () => {
        try {
          const res = await getSupplierById(id);
          reset(res.data);
        } catch (error) {
          console.error("Failed to load supplier", error);
          navigate('/suppliers');
        } finally {
          setLoading(false);
        }
      };
      fetchSupplier();
    }
  }, [id, reset, isEdit, navigate]);

  const [saveError, setSaveError] = useState('');

  const onSubmit = async (data) => {
    setSaveError('');
    try {
      const sanitized = {
        ...data,
        supplierName: data.supplierName?.trim(),
        companyName: data.companyName?.trim(),
        contactPerson: data.contactPerson?.trim(),
        phoneNumber: data.phoneNumber?.trim(),
        email: data.email?.trim() || '',
        address: data.address?.trim() || '',
        gstNumber: data.gstNumber?.trim() || '',
        paymentTerms: data.paymentTerms?.trim() || '',
      };
      if (isEdit) {
        await updateSupplier(id, sanitized);
      } else {
        await createSupplier(sanitized);
      }
      navigate('/suppliers');
    } catch (error) {
      console.error(error);
      setSaveError(error.message || 'Failed to save supplier. Please try again.');
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2482ED]"></div></div>;
  }

  return (
    <div className="w-full">
      <PageHeader 
        title={isEdit ? "Edit Supplier" : "Add New Supplier"} 
        description="Enter supplier contact and business information."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
        {saveError && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {saveError}
          </div>
        )}
        <Card>
          <CardHeader><CardTitle>Business Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input label="Supplier Name (Display Name)" required error={errors.supplierName?.message} {...register('supplierName')} />
            <Input label="Company Name (Legal Name)" required error={errors.companyName?.message} {...register('companyName')} />
            <Input label="GST Number" error={errors.gstNumber?.message} {...register('gstNumber')} />
            <div className="lg:col-span-1">
              <Input label="Payment Terms" placeholder="e.g. Net 30" error={errors.paymentTerms?.message} {...register('paymentTerms')} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input label="Contact Person" required error={errors.contactPerson?.message} {...register('contactPerson')} />
              <Input label="Phone Number" required error={errors.phoneNumber?.message} {...register('phoneNumber')} />
              <Input label="Email Address" type="email" error={errors.email?.message} {...register('email')} />
            </div>
            <div className="w-full">
              <label className="block text-[13px] font-bold text-[#162033] dark:text-white mb-1">Address</label>
              <textarea 
                className="flex w-full rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm placeholder:text-[#94A3B8] dark:placeholder:text-[#8FA9BF] text-[#162033] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2482ED]" 
                rows="3"
                {...register('address')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/suppliers')}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Save Supplier</Button>
        </div>
      </form>
    </div>
  );
};

export default SupplierForm;
