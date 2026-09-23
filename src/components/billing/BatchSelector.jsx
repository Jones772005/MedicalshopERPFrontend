import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { getValidBatches, getFefoRecommendedBatch } from '../../utils/stockUtils';
import Button from '../common/Button';
import { getInventory } from '../../services/inventoryApi';
import LoadingSpinner from '../common/LoadingSpinner';

const BatchSelector = ({ medicine, onSelect, onCancel }) => {
  const [batches, setBatches] = useState([]);
  const [recommendedBatch, setRecommendedBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await getInventory();
        const validBatches = getValidBatches(response.data, medicine.id);
        const recommended = getFefoRecommendedBatch(response.data, medicine.id);
        
        setBatches(validBatches);
        setRecommendedBatch(recommended);
      } catch (err) {
        console.error('Failed to load batches:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (medicine) {
      fetchBatches();
    }
  }, [medicine]);

  if (loading) return <div className="p-4 flex justify-center"><LoadingSpinner /></div>;

  if (batches.length === 0) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800">
        <p className="text-red-800 dark:text-red-400 font-medium">Out of Stock</p>
        <p className="text-sm text-red-600 dark:text-red-500 mt-1">There are no valid, unexpired batches available for {medicine.name}.</p>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onCancel}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 dark:text-white">Select Batch for {medicine.name}</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-500"><X className="w-5 h-5" /></button>
      </div>
      
      <div className="p-2 max-h-60 overflow-y-auto">
        <div className="space-y-2">
          {batches.map(batch => {
            const isRecommended = recommendedBatch && recommendedBatch.id === batch.id;
            
            return (
              <div 
                key={batch.id} 
                onClick={() => onSelect(batch)}
                className={`p-3 rounded-md border cursor-pointer transition-colors ${
                  isRecommended 
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40' 
                    : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-750'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white flex items-center">
                      {batch.batch || batch.batchNumber}
                      {isRecommended && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400">
                          <Check className="w-3 h-3 mr-1" /> FEFO Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                      Expiry: {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">₹{(batch.sellingPrice || batch.mrp || 0).toFixed(2)}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">Stock: {batch.quantity}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BatchSelector;
