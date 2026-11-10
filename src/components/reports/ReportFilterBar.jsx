import { useState } from 'react';
import { Search, Filter, Download, Printer } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { usePharmacyBranding } from '../../context/SettingsContext';

const ReportFilterBar = ({ onFilter, onExport, onPrint, showDateRange = true, showSearch = true, showCategory = false }) => {
  const { name: pharmacyName, logo: pharmacyLogo, defaultLogo, pharmacy } = usePharmacyBranding();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    search: '',
    category: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onFilter(filters);
  };

  const handleReset = () => {
    const reset = { startDate: '', endDate: '', search: '', category: '' };
    setFilters(reset);
    onFilter(reset);
  };

  return (
    <>
      {/* Printable Report Header with Pharmacy Branding */}
      <div className="hidden print:flex items-center justify-between border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex items-center gap-4">
          {(pharmacyLogo || defaultLogo) && (
            <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img 
                src={pharmacyLogo || defaultLogo} 
                alt={`${pharmacyName} Logo`} 
                className="max-h-full max-w-full object-contain" 
              />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold uppercase text-gray-900">{pharmacyName}</h1>
            <p className="text-xs text-gray-600">
              {[pharmacy.address, pharmacy.city, pharmacy.state ? `${pharmacy.state} - ${pharmacy.pincode || ''}`.trim() : pharmacy.pincode].filter(Boolean).join(', ')}
            </p>
            <p className="text-xs text-gray-600">
              {[pharmacy.phone && `Phone: ${pharmacy.phone}`, pharmacy.gstin && `GSTIN: ${pharmacy.gstin}`, pharmacy.drugLicenseNo && `DL: ${pharmacy.drugLicenseNo}`].filter(Boolean).join(' | ')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Official Report</p>
          <p className="text-xs text-gray-700">Generated: {new Date().toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#132B42] p-4 rounded-xl shadow-sm border border-[#DDE6F0] dark:border-[#263B50] mb-6 print:hidden">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        
        {showDateRange && (
          <>
            <div className="flex-1 min-w-[150px]">
              <Input 
                label="Start Date" 
                type="date" 
                name="startDate"
                value={filters.startDate}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <Input 
                label="End Date" 
                type="date" 
                name="endDate"
                value={filters.endDate}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {showSearch && (
          <div className="flex-1 min-w-[200px]">
            <Input 
              label="Search" 
              placeholder="Search..." 
              name="search"
              value={filters.search}
              onChange={handleChange}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        )}

        {showCategory && (
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-[#64748B] dark:text-gray-300 mb-1">Category</label>
            <select 
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="block w-full rounded-md border border-[#DDE6F0] dark:border-[#263B50] bg-white dark:bg-[#0B1A2A] px-3 py-2 text-sm text-[#162033] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2482ED]"
            >
              <option value="">All Categories</option>
              <option value="Antibiotics">Antibiotics</option>
              <option value="Painkillers">Painkillers</option>
              <option value="Vitamins">Vitamins</option>
            </select>
          </div>
        )}

        <div className="flex items-center space-x-2 w-full md:w-auto mt-4 md:mt-0">
          <Button onClick={handleApply} className="flex-1 md:flex-none">
            <Filter className="w-4 h-4 mr-2" /> Apply
          </Button>
          <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none">
            Reset
          </Button>
        </div>

      </div>

      <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-[#DDE6F0] dark:border-[#263B50]">
        <Button variant="secondary" size="sm" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
        <Button variant="secondary" size="sm" onClick={onPrint}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
      </div>
    </div>
    </>
  );
};

export default ReportFilterBar;
