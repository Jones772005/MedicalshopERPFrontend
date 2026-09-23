import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getDiscountById, createDiscount, updateDiscount } from '../../services/discountApi';
import { getMedicines } from '../../services/medicineApi';
import { getInventory } from '../../services/inventoryApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DiscountForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [medicines, setMedicines] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'medicine',
    medicineId: '',
    medicineName: '',
    batchNumber: 'All Batches',
    discountType: 'percentage',
    discountValue: '',
    maxDiscountAmount: '',
    validFrom: '',
    validUntil: '',
    status: 'active',
    description: ''
  });

  useEffect(() => {
    const init = async () => {
      try {
        const [medRes, invRes] = await Promise.all([
          getMedicines(),
          getInventory()
        ]);
        setMedicines(medRes.data || []);
        setAllBatches(invRes.data || []);
        
        if (isEdit) {
          const res = await getDiscountById(id);
          const d = res.data;
          setFormData({
            ...d,
            validFrom: d.validFrom.split('T')[0],
            validUntil: d.validUntil.split('T')[0],
            batchNumber: d.batchNumber || 'All Batches',
            discountValue: String(d.discountValue),
            maxDiscountAmount: d.maxDiscountAmount ? String(d.maxDiscountAmount) : ''
          });
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load necessary data.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-populate medicineName
      if (name === 'medicineId') {
        const med = medicines.find(m => String(m.id) === String(value));
        updated.medicineName = med ? med.name : '';
        updated.batchNumber = 'All Batches'; // reset batch on med change
      }
      
      // Reset max discount if changing to fixed
      if (name === 'discountType' && value === 'fixed') {
        updated.maxDiscountAmount = '';
      }
      
      return updated;
    });
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Discount Name is required.';
    if (!formData.medicineId) return 'Medicine is required.';
    
    const val = Number(formData.discountValue);
    if (!formData.discountValue || isNaN(val)) return 'Valid Discount Value is required.';
    
    if (formData.discountType === 'percentage') {
      if (val <= 0 || val > 100) return 'Percentage must be between 1 and 100.';
    } else {
      if (val <= 0) return 'Fixed discount amount must be greater than 0.';
    }

    if (formData.maxDiscountAmount) {
      if (Number(formData.maxDiscountAmount) <= 0) return 'Maximum discount amount must be greater than 0.';
    }

    if (!formData.validFrom) return 'Valid From date is required.';
    if (!formData.validUntil) return 'Valid Until date is required.';
    
    if (new Date(formData.validUntil) < new Date(formData.validFrom)) {
      return 'Valid Until date must be on or after Valid From date.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null
      };

      if (isEdit) {
        await updateDiscount(id, payload);
      } else {
        await createDiscount(payload);
      }
      
      navigate('/discounts');
    } catch (err) {
      setError(err.message || 'An error occurred while saving the discount.');
      setSubmitting(false);
    }
  };

  const availableBatchesForMedicine = allBatches.filter(
    b => String(b.medicineId) === String(formData.medicineId)
  );

  // deduplicate batches by batch number
  const uniqueBatchNumbers = [...new Set(availableBatchesForMedicine.map(b => b.batch))].filter(Boolean);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/discounts')} className="p-2">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Button>
          <PageHeader 
            title={isEdit ? `Edit Discount: ${id}` : 'Create Discount'} 
            description={isEdit ? 'Update existing discount parameters.' : 'Define a new promotional discount for a medicine.'}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 m-6 mb-0 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <Input 
                label="Discount Name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="e.g. October Health Offer" 
                required 
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Medicine
              </label>
              <select 
                name="medicineId"
                value={formData.medicineId}
                onChange={handleChange}
                required
                className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Medicine</option>
                {medicines.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Batch
              </label>
              <select 
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                disabled={!formData.medicineId}
                className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <option value="All Batches">All Batches</option>
                {uniqueBatchNumbers.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Type
              </label>
              <select 
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            
            <div className="col-span-2 md:col-span-1 flex space-x-4">
              <div className="flex-1">
                <Input 
                  label={`Value ${formData.discountType === 'percentage' ? '(%)' : '(₹)'}`}
                  type="number" 
                  step="0.01" 
                  min="0"
                  max={formData.discountType === 'percentage' ? "100" : undefined}
                  name="discountValue" 
                  value={formData.discountValue} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="flex-1">
                <Input 
                  label="Max Discount (₹)" 
                  type="number" 
                  step="0.01"
                  min="0"
                  name="maxDiscountAmount" 
                  value={formData.maxDiscountAmount} 
                  onChange={handleChange} 
                  disabled={formData.discountType === 'fixed'}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <Input 
                label="Valid From" 
                type="date" 
                name="validFrom" 
                value={formData.validFrom} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <Input 
                label="Valid Until" 
                type="date" 
                name="validUntil" 
                value={formData.validUntil} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex justify-end space-x-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/discounts')} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Discount</>}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DiscountForm;
