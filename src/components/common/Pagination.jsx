import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange
}) => {
  if (totalPages <= 0 && totalItems <= 0) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Build compact page numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Pages around current
    const rangeStart = Math.max(2, currentPage - 1);
    const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div
      className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t transition-colors"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
    >
      {/* Left: Info and page-size selector */}
      <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-slate-300">
        <p className="whitespace-nowrap">
          Showing{' '}
          <span className="font-medium text-gray-900 dark:text-white">{startItem}</span>
          {totalItems > 0 && (
            <> to <span className="font-medium text-gray-900 dark:text-white">{endItem}</span></>
          )}{' '}
          of <span className="font-medium text-gray-900 dark:text-white">{totalItems}</span> results
        </p>
        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5">
            <label htmlFor="pageSizeSelect" className="whitespace-nowrap text-[13px] text-gray-500 dark:text-slate-400">
              Rows per page:
            </label>
            <select
              id="pageSizeSelect"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="h-[30px] px-1.5 text-[13px] font-medium border rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2482ED] transition-colors bg-white dark:bg-[#102A43] border-[#D9E6F2] dark:border-[#23415C] text-[#162033] dark:text-[#D9E6F2]"
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page navigation (only if more than 1 page) */}
      {totalPages > 1 && (
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          
          {getPageNumbers().map((page, idx) =>
            page === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-[#102A43] text-sm font-medium text-gray-400 dark:text-slate-500 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
                className={cn(
                  "relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer",
                  page === currentPage
                    ? "z-10 bg-[#1677FF] border-[#1677FF] text-white"
                    : "bg-white dark:bg-[#102A43] border-[#D9E6F2] dark:border-[#23415C] text-[#627D98] dark:text-[#B8CCE0] hover:bg-[#EAF4FF] dark:hover:bg-[#163A59]"
                )}
              >
                {page}
              </button>
            )
          )}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
};

export default Pagination;

