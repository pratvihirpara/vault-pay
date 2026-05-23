import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export interface CustomPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (size: number) => void;
  itemsPerPageOptions?: number[];
  itemName?: string;
  syncWithUrl?: boolean;
  urlParamName?: string;
  loading?: boolean;
}

export function CustomPagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  itemName = 'items',
  syncWithUrl = false,
  urlParamName = 'page',
  loading = false,
}: CustomPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Handle URL sync if enabled
  React.useEffect(() => {
    if (syncWithUrl) {
      const params = new URLSearchParams(window.location.search);
      const urlPage = Number(params.get(urlParamName));
      if (urlPage && urlPage !== currentPage && urlPage <= totalPages && urlPage >= 1) {
        onPageChange(urlPage);
      }
    }
  }, [syncWithUrl, urlParamName, totalPages]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage || loading) return;
    onPageChange(page);

    if (syncWithUrl) {
      const params = new URLSearchParams(window.location.search);
      params.set(urlParamName, String(page));
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  // Helper to generate the numbers range with ellipsis
  const getPageRange = () => {
    const delta = 1; // pages count around current page
    const range = [];
    const rangeWithDots: (number | string)[] = [];
    let prevIndex: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (prevIndex !== undefined) {
        if (i - prevIndex === 2) {
          rangeWithDots.push(prevIndex + 1);
        } else if (i - prevIndex > 2) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      prevIndex = i;
    }

    return rangeWithDots;
  };

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const pageRange = getPageRange();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4 px-1 select-none w-full border-t border-slate-800/40 mt-2">
      {/* Total and range results indicator */}
      <div className="text-xs text-slate-400 font-medium">
        Showing{' '}
        <span className="text-slate-900 dark:text-slate-200 font-bold">
          {startIndex}
        </span>{' '}
        to{' '}
        <span className="text-slate-900 dark:text-slate-200 font-bold">
          {endIndex}
        </span>{' '}
        of{' '}
        <span className="text-slate-900 dark:text-slate-200 font-bold">
          {totalItems}
        </span>{' '}
        {itemName}
      </div>

      <div className="flex flex-wrap items-center gap-4 self-end sm:self-auto">
        {/* Rows per page selector */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Rows</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                onItemsPerPageChange(newSize);
                onPageChange(1);
                if (syncWithUrl) {
                  const params = new URLSearchParams(window.location.search);
                  params.set(urlParamName, '1');
                  const newUrl = `${window.location.pathname}?${params.toString()}`;
                  window.history.pushState({ path: newUrl }, '', newUrl);
                }
              }}
              disabled={loading}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-lg p-1.5 focus:border-[#7C3AED] outline-none transition-colors cursor-pointer disabled:opacity-50"
            >
              {itemsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          {/* Previous Page Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 disabled:cursor-not-allowed transition-all"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers with Ellipses */}
          <div className="flex items-center gap-1 text-xs">
            {pageRange.map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`dots-${index}`}
                    className="w-8 h-8 flex items-center justify-center text-slate-400"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                );
              }

              const pageNum = page as number;
              const isSelected = pageNum === currentPage;

              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading}
                  className="relative w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all overflow-hidden"
                >
                  {/* Glowing background ring for selected page */}
                  {isSelected && (
                    <motion.div
                      layoutId="activePageRing"
                      className="absolute inset-0 bg-[#7C3AED] rounded-lg shadow-md shadow-[#7C3AED]/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 font-bold transition-colors ${
                      isSelected
                        ? 'text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg w-full h-full flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {pageNum}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Next Page Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 disabled:cursor-not-allowed transition-all"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
