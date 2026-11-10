import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft } from 'lucide-react';
import { createCustomer, getCustomerById, updateCustomer } from "../../services/customerApi"; // Mocked creation/updating in a real app
import { isValidIndianMobile, isValidEmail, normalizeIndianMobile, notifyValidationError } from '../../utils/validation';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

const customerSchema = z.object({
  name: z.string().trim().min(2, 'Customer name must be at least 2 characters').max(100, 'Customer name cannot exceed 100 characters'),
  phoneNumber: z.string().trim().refine(isValidIndianMobile, {
    message: 'Enter a valid 10-digit Indian mobile number (e.g., 9876543210)'
  }),
  email: z.string().trim().refine(val => !val || isValidEmail(val), {
    message: 'Enter a valid email address'
  }).optional(),
  address: z.string().trim().max(300, 'Address cannot exceed 300 characters').optional(),
  type: z.enum(['Regular', 'Wholesale', 'New']),
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters').optional()
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
      const sanitized = {
        ...data,
        name: data.name?.trim(),
        phoneNumber: normalizeIndianMobile(data.phoneNumber),
        email: data.email?.trim() || '',
        address: data.address?.trim() || '',
        notes: data.notes?.trim() || '',
      };
      if (isEdit) {
        await updateCustomer(id, sanitized);
      } else {
        await createCustomer({
          ...sanitized,
          loyaltyPoints: 0,
          outstandingPayment: 0,
          status: 'Active'
        });
      }
      navigate('/customers');
    } catch (error) {
      console.error('Failed to save customer', error);
      setSaveError(error.message || 'Failed to save. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2482ED]"></div></div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => navigate('/customers')} className="inline-flex items-center text-xs text-[#64748B] hover:text-[#162033] dark:hover:text-white p-0 h-auto">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Customers
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit, (errs) => notifyValidationError(errs))} className="space-y-6 w-full">
        <Card>
          <CardHeader><CardTitle>Customer Information</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input label="Full Name" required error={errors.name?.message} {...register('name')} />
              <Input label="Phone Number" required error={errors.phoneNumber?.message} {...register('phoneNumber')} />
              <Input label="Email Address" type="email" error={errors.email?.message} {...register('email')} />
              <div className="lg:col-span-1">
                <label className="block text-[13px] font-bold text-[#162033] dark:text-white mb-1">
                  Customer Type <span className="text-red-500">*</span>
                </label>
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
