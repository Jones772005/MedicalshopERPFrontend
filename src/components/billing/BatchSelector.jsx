import { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { getValidBatches, getFefoRecommendedBatch } from '../../utils/stockUtils';
import Button from '../common/Button';
import { getInventory } from '../../services/inventoryApi';
import LoadingSpinner from '../common/LoadingSpinner';

const BatchSelector = ({ medicine, onSelect, onCancel }) => {
  const [batches, setBatches] = useState([]);
  const [recommendedBatch, setRecommendedBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await getInventory();
        const validBatches = getValidBatches(response.data, medicine.id);
        const recommended = getFefoRecommendedBatch(response.data, medicine.id);
        
        setBatches(validBatches);
        setRecommendedBatch(recommended);

        // Highlight recommended batch by default if available
        if (validBatches.length > 0) {
          const recIdx = validBatches.findIndex(b => recommended && recommended.id === b.id);
          setHighlightedIndex(recIdx >= 0 ? recIdx : 0);
        }
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

  // Focus container or close button when loaded
  useEffect(() => {
    if (!loading) {
      if (batches.length === 0) {
        closeBtnRef.current?.focus();
      } else {
        containerRef.current?.focus();
      }
    }
  }, [loading, batches.length]);

  // Scroll active item into view
  useEffect(() => {
    if (itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e) => {
    if (batches.length === 0) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < batches.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : batches.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (batches[highlightedIndex]) {
        onSelect(batches[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  if (loading) return <div className="p-4 flex justify-center"><LoadingSpinner /></div>;

  if (batches.length === 0) {
    return (
      <div 
        className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          }
        }}
      >
        <p className="text-red-800 dark:text-red-400 font-medium">Out of Stock</p>
        <p className="text-sm text-red-600 dark:text-red-500 mt-1">There are no valid, unexpired batches available for {medicine.name}.</p>
        <div className="mt-4 flex justify-end">
          <Button ref={closeBtnRef} variant="secondary" size="sm" onClick={onCancel}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="bg-white dark:bg-[#102A43] border border-[#DDE6F0] dark:border-slate-700/50 rounded-xl shadow-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#2482ED]"
      aria-label={`Select batch for ${medicine.name}`}
    >
      <div className="px-4 py-3 border-b border-[#DDE6F0] dark:border-slate-700/50 bg-[#F5F8FC] dark:bg-slate-800/50 flex justify-between items-center">
        <h3 className="text-[13px] font-bold text-[#162033] dark:text-white">Select Batch for {medicine.name}</h3>
        <button 
          onClick={onCancel} 
          aria-label="Close batch selector"
          className="text-[#64748B] hover:text-[#162033] dark:hover:text-white transition-colors cursor-pointer rounded p-1 focus:outline-none focus:ring-2 focus:ring-[#2482ED]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-2 max-h-60 overflow-y-auto">
        <div className="space-y-2">
          {batches.map((batch, index) => {
            const isRecommended = recommendedBatch && recommendedBatch.id === batch.id;
            const isHighlighted = index === highlightedIndex;
            
            return (
              <div 
                key={batch.id} 
                ref={(el) => { itemRefs.current[index] = el; }}
                role="button"
                tabIndex={-1}
                aria-selected={isHighlighted}
                onClick={() => onSelect(batch)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isHighlighted 
                    ? 'ring-2 ring-[#2482ED] shadow-md ' 
                    : ''
                }${
                  isRecommended 
                    ? 'border-[#24C9A0] dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40' 
                    : 'border-[#DDE6F0] dark:border-slate-700/50 bg-white dark:bg-[#102A43] hover:bg-[#F5F8FC] dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[13px] font-bold text-[#162033] dark:text-white flex items-center">
                      {batch.batch || batch.batchNumber}
                      {isRecommended && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#24C9A0]/20 text-[#1BA885] dark:bg-emerald-900/40 dark:text-emerald-400">
                          <Check className="w-3 h-3 mr-1" /> FEFO Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 mt-1 flex flex-wrap gap-x-3">
                      <span>Expiry: {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : 'N/A'}</span>
                      <span>Rack No: <span className="font-semibold">{batch.rack || '—'}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-[#162033] dark:text-white">₹{(batch.sellingPrice || batch.mrp || 0).toFixed(2)}</div>
                    <div className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 mt-1">Stock: {batch.quantity}</div>
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
