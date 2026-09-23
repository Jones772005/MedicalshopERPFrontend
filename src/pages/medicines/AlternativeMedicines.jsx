import { useState, useEffect } from 'react';
import { Search, AlertTriangle, PackageSearch } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { getMedicines } from '../../services/medicineApi';
import { getAlternativeMedicines } from '../../services/alternativeMedicineApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AlternativeMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loadingAlts, setLoadingAlts] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const res = await getMedicines();
        setMedicines(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchMeds();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setSelectedMedicine(null);
    setAlternatives([]);
  };

  const handleSelectMedicine = async (med) => {
    setSelectedMedicine(med);
    setSearchTerm('');
    setLoadingAlts(true);
    try {
      const res = await getAlternativeMedicines(med.id);
      setAlternatives(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAlts(false);
    }
  };

  const searchResults = searchTerm.length > 1 
    ? medicines.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.genericName?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

  const columns = [
    { header: 'Medicine Name', accessor: 'name', cell: (row) => <span className="font-bold text-gray-900 dark:text-white">{row.name}</span> },
    { header: 'Generic Composition', accessor: 'genericName', cell: (row) => <span className="text-gray-600 dark:text-slate-300">{row.genericName || 'N/A'}</span> },
    { header: 'Manufacturer', accessor: 'manufacturer', cell: (row) => <span className="text-gray-600 dark:text-slate-300">{row.manufacturer || 'N/A'}</span> },
    { header: 'MRP', accessor: 'mrp', cell: (row) => `₹${row.mrp || 0}` },
    { header: 'Available Qty', accessor: 'availableQuantity', cell: (row) => (
      <span className={`font-bold ${row.availableQuantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {row.availableQuantity || 0}
      </span>
    )},
    { header: 'Prescription Required', accessor: 'prescriptionRequired', cell: (row) => row.prescriptionRequired ? 'Yes' : 'No' }
  ];

  if (initialLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader 
        title="Alternative Medicines" 
        description="Find alternative brands and generic equivalents for medicines."
      />

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded shadow-sm">
        <div className="flex">
          <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
          <div className="ml-3">
            <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-400">Important Medical Disclaimer</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Medicine substitution must be verified and approved by a qualified pharmacist or healthcare professional according to applicable requirements. 
              The alternatives shown are based on composition similarity and do not guarantee medical equivalence.
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Medicine to Find Alternatives</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-600 rounded-md leading-5 bg-gray-50 dark:bg-slate-900 placeholder-gray-500 dark:placeholder-slate-400 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            placeholder="Search by brand name or generic composition..."
            value={searchTerm}
            onChange={handleSearch}
          />

          {searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 shadow-lg rounded-md border border-gray-200 dark:border-slate-700 overflow-hidden">
              <ul className="max-h-60 overflow-auto divide-y divide-gray-100 dark:divide-slate-700">
                {searchResults.map(med => (
                  <li 
                    key={med.id} 
                    className="p-3 hover:bg-gray-50 dark:hover:bg-slate-750 cursor-pointer transition-colors"
                    onClick={() => handleSelectMedicine(med)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{med.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{med.genericName}</p>
                      </div>
                      <span className="text-xs text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded">
                        Select
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Selected Medicine Context */}
      {selectedMedicine && (
        <div className="bg-primary-50 dark:bg-slate-800 p-6 rounded-lg border border-primary-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Alternatives for: {selectedMedicine.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="block text-gray-500 dark:text-slate-400">Generic</span>
              <span className="font-medium text-gray-900 dark:text-white">{selectedMedicine.genericName || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-gray-500 dark:text-slate-400">Manufacturer</span>
              <span className="font-medium text-gray-900 dark:text-white">{selectedMedicine.manufacturer || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-gray-500 dark:text-slate-400">Category</span>
              <span className="font-medium text-gray-900 dark:text-white">{selectedMedicine.category || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {selectedMedicine && (
        <div className="mt-8">
          {loadingAlts ? (
            <LoadingSpinner />
          ) : alternatives.length > 0 ? (
            <DataTable 
              columns={columns}
              data={alternatives}
              searchPlaceholder="Filter alternatives..."
            />
          ) : (
            <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-lg border border-gray-200 dark:border-slate-700">
              <PackageSearch className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Alternatives Found</h3>
              <p className="text-gray-500 dark:text-slate-400">We couldn't find any direct alternatives in our database for this medicine.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlternativeMedicines;
