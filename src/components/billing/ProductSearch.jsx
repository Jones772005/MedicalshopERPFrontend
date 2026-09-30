import { useState, useEffect, forwardRef, useRef } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import Input from '../common/Input';
import { getMedicines } from '../../services/medicineApi';
import { getMedicineStock } from '../../services/inventoryApi';

const ProductSearch = forwardRef(({ onProductSelect }, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [results, setResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const internalInputRef = useRef(null);
  const inputRef = ref || internalInputRef;
  const itemRefs = useRef([]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await getMedicines();
        setMedicines(response.data);
        // Build stock map from live inventory batches (BUG-005 fix)
        setStockMap(getMedicineStock());
      } catch (err) {
        console.error('Failed to load medicines for search', err);
      }
    };
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      if (results.length > 0) {
        setResults([]);
        setIsOpen(false);
      }
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = medicines.filter(m => 
      m.name.toLowerCase().includes(term) || 
      (m.genericName && m.genericName.toLowerCase().includes(term)) ||
      (m.brandName && m.brandName.toLowerCase().includes(term)) ||
      (m.barcode && m.barcode.includes(term))
    );
    setResults(filtered);
    setHighlightedIndex(0);
    setIsOpen(filtered.length > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, medicines]);

  useEffect(() => {
    if (isOpen && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  const handleSelectMedicine = (medicine) => {
    const availableQty = stockMap[medicine.id] ?? 0;
    if (availableQty > 0) {
      onProductSelect({ ...medicine, availableStock: availableQty });
      setSearchTerm('');
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        e.preventDefault();
        handleSelectMedicine(results[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id="medicineSearchInput"
        placeholder="Search by Medicine Name, Generic Name, or Barcode... (F2)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => {
          if (results.length > 0) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        icon={<Search className="w-4 h-4" />}
        aria-label="Medicine search"
      />

      {isOpen && results.length > 0 && (
        <div 
          className="absolute z-30 w-full mt-1 bg-white dark:bg-[#102A43] border border-[#DDE6F0] dark:border-slate-700/50 rounded-lg shadow-xl max-h-60 overflow-y-auto"
          role="listbox"
          aria-label="Medicine search results"
        >
          <ul className="divide-y divide-[#DDE6F0] dark:divide-slate-700/50 p-1">
            {results.map((medicine, index) => {
              const isSelected = index === highlightedIndex;
              const availableQty = stockMap[medicine.id] ?? 0;
              const isOutOfStock = availableQty <= 0;

              return (
                <li 
                  key={medicine.id}
                  ref={(el) => { itemRefs.current[index] = el; }}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => handleSelectMedicine(medicine)}
                  className={`p-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#EAF3FE] dark:bg-[#163A59] ring-2 ring-[#2482ED] shadow-sm' 
                      : 'hover:bg-[#F5F8FC] dark:hover:bg-slate-800/50'
                  } ${isOutOfStock ? 'opacity-70' : ''}`}
                >
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-[#162033] dark:text-white flex items-center">
                      {medicine.name}
                      {medicine.prescriptionRequired && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Rx
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-medium text-[#64748B] dark:text-slate-400">
                      {medicine.genericName}{medicine.brandName ? ` | ${medicine.brandName}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto">
                    <div className="text-[13px] font-bold text-[#162033] dark:text-white">
                      ₹{(medicine.sellingPrice || medicine.mrp || 0).toFixed(2)}
                    </div>
                    {isOutOfStock ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold text-red-500 dark:text-red-400">Out of Stock</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#24C9A0] dark:text-emerald-400 font-bold">
                        Stock: {availableQty}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
});

ProductSearch.displayName = 'ProductSearch';

export default ProductSearch;
