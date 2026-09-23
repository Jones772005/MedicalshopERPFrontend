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
  supplierName: z.string().min(2, 'Supplier Name is required'),
  companyName: z.string().min(2, 'Company Name is required'),
  contactPerson: z.string().min(2, 'Contact Person is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  paymentTerms: z.string().optional(),
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

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateSupplier(id, data);
      } else {
        await createSupplier(data);
      }
      navigate('/suppliers');
    } catch (error) {
      console.error(error);
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
        <Card>
          <CardHeader><CardTitle>Business Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input label="Supplier Name (Display Name)" error={errors.supplierName?.message} {...register('supplierName')} />
            <Input label="Company Name (Legal Name)" error={errors.companyName?.message} {...register('companyName')} />
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
              <Input label="Contact Person" error={errors.contactPerson?.message} {...register('contactPerson')} />
              <Input label="Phone Number" error={errors.phoneNumber?.message} {...register('phoneNumber')} />
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
