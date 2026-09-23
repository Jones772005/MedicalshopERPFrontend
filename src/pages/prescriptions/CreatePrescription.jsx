import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Plus, Trash2, FileUp } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { getCustomers } from '../../services/customerApi';
import { getMedicines } from '../../services/medicineApi';
import { createPrescription } from '../../services/prescriptionApi';

const prescriptionSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  doctorName: z.string().min(1, 'Doctor name is required'),
  doctorContact: z.string().optional(),
  prescriptionDate: z.string().min(1, 'Date is required'),
  medicines: z.array(z.object({
    medicineId: z.string().min(1, 'Medicine is required'),
    quantity: z.number().min(1, 'Quantity is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    duration: z.string().min(1, 'Duration is required'),
    instructions: z.string().optional()
  })).min(1, 'At least one medicine is required')
});

const CreatePrescription = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      prescriptionDate: new Date().toISOString().split('T')[0],
      medicines: [{ medicineId: '', quantity: 1, dosage: '', frequency: '', duration: '', instructions: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medicines'
  });

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [cRes, mRes] = await Promise.all([getCustomers(), getMedicines()]);
        setCustomers(cRes.data);
        setMedicines(mRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSelectData();
  }, []);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const customerName = customers.find(c => c.id.toString() === data.customerId)?.name || 'Unknown';
      const formattedData = {
        ...data,
        customerId: parseInt(data.customerId),
        customerName,
        documentName: fileName || 'prescription_upload.pdf',
        medicines: data.medicines.map(m => {
          const medName = medicines.find(med => med.id.toString() === m.medicineId)?.name || 'Unknown';
          return {
            ...m,
            medicineId: parseInt(m.medicineId),
            medicineName: medName
          };
        })
      };
      
      await createPrescription(formattedData);
      navigate('/prescriptions');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader 
        title="Upload Prescription" 
        description="Enter prescription details and submit for verification."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Prescription Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer *</label>
                <select 
                  {...register('customerId')}
                  className={`block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 ${errors.customerId ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.customerId && <span className="text-xs text-red-500">{errors.customerId.message}</span>}
              </div>
              <Input 
                label="Date *" 
                type="date"
                {...register('prescriptionDate')} 
                error={errors.prescriptionDate?.message}
              />
              <Input 
                label="Doctor Name *" 
                {...register('doctorName')} 
                error={errors.doctorName?.message}
              />
              <Input 
                label="Doctor Contact" 
                {...register('doctorContact')} 
                error={errors.doctorContact?.message}
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prescription Document</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-750 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileUp className="w-8 h-8 text-gray-400 dark:text-slate-500 mb-2" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-slate-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    {fileName && <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{fileName}</p>}
                  </div>
                  <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Prescribed Medicines</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ medicineId: '', quantity: 1, dosage: '', frequency: '', duration: '', instructions: '' })}>
              <Plus className="w-4 h-4 mr-2" /> Add Medicine
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900/30 relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Medicine *</label>
                    <select 
                      {...register(`medicines.${index}.medicineId`)}
                      className={`block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100 ${errors.medicines?.[index]?.medicineId ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select Medicine...</option>
                      {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Total Qty *</label>
                    <input 
                      type="number"
                      min="1"
                      {...register(`medicines.${index}.quantity`, { valueAsNumber: true })}
                      className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Dosage *</label>
                    <input 
                      type="text"
                      placeholder="e.g. 500mg"
                      {...register(`medicines.${index}.dosage`)}
                      className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency *</label>
                    <input 
                      type="text"
                      placeholder="e.g. Twice a day"
                      {...register(`medicines.${index}.frequency`)}
                      className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Duration *</label>
                    <input 
                      type="text"
                      placeholder="e.g. 5 days"
                      {...register(`medicines.${index}.duration`)}
                      className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Instructions</label>
                    <input 
                      type="text"
                      placeholder="e.g. Take after meals"
                      {...register(`medicines.${index}.instructions`)}
                      className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-100"
                    />
                  </div>
                </div>
                {fields.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => remove(index)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {errors.medicines && <p className="text-sm text-red-500">{errors.medicines.message}</p>}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/prescriptions')} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            <Save className="w-4 h-4 mr-2" />
            {submitting ? 'Saving...' : 'Submit Prescription'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePrescription;
