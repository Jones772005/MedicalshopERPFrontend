import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle, SearchCode } from 'lucide-react';
import Input from '../common/Input';
import { getMedicines } from '../../services/medicineApi';
import { getMedicineStock } from '../../services/inventoryApi';

const ProductSearch = ({ onProductSelect }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [results, setResults] = useState([]);

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
      }
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = medicines.filter(m => 
      m.name.toLowerCase().includes(term) || 
      (m.genericName && m.genericName.toLowerCase().includes(term)) ||
      (m.barcode && m.barcode.includes(term))
    );
    setResults(filtered);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, medicines]);

  return (
    <div className="relative">
      <Input
        placeholder="Search by Medicine Name, Generic Name, or Barcode..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        icon={<Search className="w-4 h-4" />}
      />

      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul className="divide-y divide-gray-200 dark:divide-slate-700">
            {results.map((medicine) => (
              <li 
                key={medicine.id}
                className="p-3 hover:bg-gray-50 dark:hover:bg-slate-750 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
              >
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    const availableQty = stockMap[medicine.id] ?? 0;
                    if (availableQty > 0) {
                      onProductSelect({ ...medicine, availableStock: availableQty });
                      setSearchTerm('');
                      setResults([]);
                    }
                  }}
                >
                  <div className="font-medium text-gray-900 dark:text-white flex items-center">
                    {medicine.name}
                    {medicine.prescriptionRequired && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Rx
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{medicine.genericName} | {medicine.brandName}</div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">₹{(medicine.sellingPrice || medicine.mrp || 0).toFixed(2)}</div>
                  {(stockMap[medicine.id] ?? 0) <= 0 ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-red-600 dark:text-red-400">Out of Stock</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/medicines/alternatives');
                        }}
                        className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-1 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 flex items-center transition-colors font-medium"
                      >
                        <SearchCode className="w-3 h-3 mr-1" /> Find Alt
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-green-600 dark:text-green-500 font-medium">Stock: {stockMap[medicine.id]}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
