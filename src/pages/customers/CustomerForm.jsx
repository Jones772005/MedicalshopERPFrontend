import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createCustomer, getCustomerById, updateCustomer } from "../../services/customerApi"; // Mocked creation/updating in a real app
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';


const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  address: z.string().optional(),
  type: z.enum(['Regular', 'Wholesale', 'New']),
  notes: z.string().optional()
});

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      type: "New"
    }
  });

  useEffect(() => {
    if (isEdit) {
      const fetchCustomer = async () => {
        try {
          const res = await getCustomerById(id);
          reset(res.data);
        } catch (error) {
          console.error("Failed to load customer", error);
          navigate('/customers');
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id, reset, isEdit, navigate]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSaveError('');
    try {
      if (isEdit) {
        await updateCustomer(id, data);
      } else {
        await createCustomer({
          ...data,
          loyaltyPoints: 0,
          outstandingPayment: 0,
          status: 'Active'
        });
      }
      navigate('/customers');
    } catch (error) {
      console.error('Failed to save customer', error);
      setSaveError('Failed to save. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2482ED]"></div></div>;
  }

  return (
    <div className="w-full">
      <PageHeader 
        title={isEdit ? "Edit Customer" : "Add New Customer"} 
        description="Enter customer contact information and details."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
        <Card>
          <CardHeader><CardTitle>Customer Information</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input label="Full Name" error={errors.name?.message} {...register('name')} />
              <Input label="Phone Number" error={errors.phoneNumber?.message} {...register('phoneNumber')} />
              <Input label="Email Address" type="email" error={errors.email?.message} {...register('email')} />
              <div className="lg:col-span-1">
                <label className="block text-[13px] font-bold text-[#162033] dark:text-white mb-1">Customer Type</label>
                <select
                  {...register('type')}
                  className="block w-full h-10 rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm text-[#162033] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2482ED]"
                >
                  <option value="New">New</option>
                  <option value="Regular">Regular</option>
                  <option value="Wholesale">Wholesale</option>
                </select>
              </div>
            </div>
            <div className="w-full">
              <label className="block text-[13px] font-bold text-[#162033] dark:text-white mb-1">Address</label>
              <textarea
                className="flex w-full rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm placeholder:text-[#94A3B8] dark:placeholder:text-[#8FA9BF] text-[#162033] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2482ED]"
                rows="3"
                {...register('address')}
              />
            </div>
            {saveError && <p className="text-sm text-red-500 dark:text-red-400">{saveError}</p>}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/customers')}>Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Customer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
