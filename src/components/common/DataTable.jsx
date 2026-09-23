import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import Pagination from './Pagination';

const DataTable = ({ 
  columns, 
  data, 
  searchPlaceholder = "Search...", 
  loading = false, 
  emptyMessage = "No data found",
  itemsPerPage = 10,
  searchable = true,
  customToolbar = null
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Handle sorting
  const handleSort = (accessor) => {
    if (!accessor) return;
    
    let direction = 'asc';
    if (sortConfig.key === accessor && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: accessor, direction });
  };

  // Filter and Sort Data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Filter
    if (searchTerm) {
      filtered = filtered.filter((row) => 
        Object.values(row).some(
          value => 
            value && 
            typeof value !== 'object' && 
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig]);

  // Pagination
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Ensure current page is valid after filtering
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  } else if (currentPage === 0 && totalPages > 0) {
    setCurrentPage(1);
  }

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const renderSortIcon = (accessor) => {
    if (!accessor) return null;
    if (sortConfig.key !== accessor) return <ChevronsUpDown className="w-4 h-4 ml-1 opacity-20" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 ml-1 text-primary-600" /> 
      : <ChevronDown className="w-4 h-4 ml-1 text-primary-600" />;
  };

  return (
    <div
      className="shadow-sm rounded-lg overflow-hidden flex flex-col transition-colors"
      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
    >
      {(searchable || customToolbar) && (
        <div
          className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 transition-colors"
          style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)' }}
        >
          {searchable ? (
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 rounded-lg leading-5 placeholder-[#94A3B8] dark:placeholder-[#8FA9BF] text-[#162033] dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#2482ED] focus:border-[#2482ED] sm:text-sm transition duration-150 ease-in-out"
                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)' }}
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          ) : <div></div>}
          
          {customToolbar && (
            <div className="flex items-center space-x-2">
              {customToolbar}
            </div>
          )}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead style={{ backgroundColor: 'var(--table-header-bg)' }}>
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  scope="col" 
                  className={`px-6 py-3 text-left uppercase tracking-[0.04em] ${col.sortable !== false && col.accessor ? 'cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5' : ''}`}
                  style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}
                  onClick={() => col.sortable !== false && handleSort(col.accessor)}
                >
                  <div className="flex items-center">
                    {col.header}
                    {col.sortable !== false && renderSortIcon(col.accessor)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className="divide-y"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
          >
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <p className="text-sm text-gray-500 dark:text-slate-400">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="transition-colors h-[46px]"
                  style={{ borderColor: 'var(--border-color)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--table-hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-3 whitespace-nowrap text-sm text-[#162033] dark:text-[#D9E6F2]">
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {!loading && totalItems > 0 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      )}
    </div>
  );
};

export default DataTable;
