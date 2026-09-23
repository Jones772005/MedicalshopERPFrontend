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
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

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

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        
        <Card>
          <CardHeader><CardTitle>Discount Information</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Discount Name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="e.g. October Health Offer" 
                required 
              />
              <div>
                <label className="block text-[13px] font-bold text-[#162033] dark:text-white mb-1">
                  Status
                </label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full h-10 rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm text-[#162033] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2482ED]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-bold text-[#162033] dark:text-white mb-1">
                  Medicine
                </label>
                <select 
                  name="medicineId"
                  value={formData.medicineId}
                  onChange={handleChange}
                  required
                  className="block w-full h-10 rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm text-[#162033] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2482ED]"
                >
                  <option value="">Select Medicine</option>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[13px] font-bold text-[#162033] dark:text-white mb-1">
                  Batch
                </label>
                <select 
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  disabled={!formData.medicineId}
                  className="block w-full h-10 rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm text-[#162033] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2482ED] disabled:opacity-50"
                >
                  <option value="All Batches">All Batches</option>
                  {uniqueBatchNumbers.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[13px] font-bold text-[#162033] dark:text-white mb-1">
                  Discount Type
                </label>
                <select 
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  className="block w-full h-10 rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm text-[#162033] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2482ED]"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Valid From" 
                type="date" 
                name="validFrom" 
                value={formData.validFrom} 
                onChange={handleChange} 
                required 
              />
              <Input 
                label="Valid Until" 
                type="date" 
                name="validUntil" 
                value={formData.validUntil} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="w-full">
              <label className="block text-[13px] font-bold text-[#162033] dark:text-white mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-lg border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#132B42] px-3 py-2 text-sm placeholder:text-[#94A3B8] dark:placeholder:text-[#8FA9BF] text-[#162033] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2482ED]"
              />
            </div>

          </CardContent>
        </Card>
        
        <div className="flex justify-end space-x-4">
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
