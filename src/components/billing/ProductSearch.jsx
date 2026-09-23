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
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#102A43] border border-[#DDE6F0] dark:border-slate-700/50 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          <ul className="divide-y divide-[#DDE6F0] dark:divide-slate-700/50">
            {results.map((medicine) => (
              <li 
                key={medicine.id}
                className="p-3 hover:bg-[#F5F8FC] dark:hover:bg-slate-800/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 transition-colors"
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
                  <div className="text-[13px] font-bold text-[#162033] dark:text-white flex items-center">
                    {medicine.name}
                    {medicine.prescriptionRequired && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Rx
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-[#64748B] dark:text-slate-400">{medicine.genericName} | {medicine.brandName}</div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto">
                  <div className="text-[13px] font-bold text-[#162033] dark:text-white">₹{(medicine.sellingPrice || medicine.mrp || 0).toFixed(2)}</div>
                  {(stockMap[medicine.id] ?? 0) <= 0 ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-red-500 dark:text-red-400">Out of Stock</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/medicines/alternatives');
                        }}
                        className="text-[11px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-1 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 flex items-center transition-colors font-bold"
                      >
                        <SearchCode className="w-3 h-3 mr-1" /> Find Alt
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#24C9A0] dark:text-emerald-400 font-bold">Stock: {stockMap[medicine.id]}</div>
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
