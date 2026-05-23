import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { CustomPagination } from '@/components/ui/CustomPagination';

interface RecentActivityProps {
  transactions: Transaction[];
  enablePagination?: boolean;
}

export function RecentActivity({ transactions, enablePagination = false }: RecentActivityProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalItems = transactions.length;

  if (totalItems === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
        No recent activity
      </div>
    );
  }

  const displayedActivity = enablePagination
    ? transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : transactions.slice(0, 5);

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {displayedActivity.map((tx, i) => {
          const isCredit = tx.type === 'credit';
          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800/40 transition-colors"
            >
              <div className={`p-2 rounded-lg ${isCredit ? 'bg-emerald-500/15' : 'bg-rose-500/15'}`}>
                {isCredit ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-rose-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{tx.description}</p>
                <p className="text-xs text-slate-500">{formatDate(tx.created_at)}</p>
              </div>
              <div className={`text-sm font-mono font-medium ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isCredit ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
              </div>
            </motion.div>
          );
        })}
      </div>

      {enablePagination && totalItems > 5 && (
        <CustomPagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          itemsPerPageOptions={[5, 10, 20]}
          itemName="activities"
          syncWithUrl={true}
          urlParamName="act_page"
        />
      )}
    </div>
  );
}
