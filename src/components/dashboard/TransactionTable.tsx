import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Clock, Circle as XCircle, CircleCheck as CheckCircle2, Pencil } from 'lucide-react';
import type { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomPagination } from '@/components/ui/CustomPagination';

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit?: (transaction: Transaction) => void;
  enablePagination?: boolean;
}

const statusConfig = {
  completed: { icon: CheckCircle2, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  pending: { icon: Clock, color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  failed: { icon: XCircle, color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
};

const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'Salary':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Freelance':
      return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    case 'Food & Groceries':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Food & Drinks':
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    case 'Dining Out':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'Subscription':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'Bills & Utilities':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case 'Transport':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    case 'Travel':
      return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    case 'Health & Fitness':
      return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

export function TransactionTable({ transactions, loading, onEdit, enablePagination = false }: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalItems = transactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset page if filters shrink count
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [transactions, totalPages, currentPage]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/30">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <ArrowDownRight className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-sm font-medium">No transactions found</p>
        <p className="text-xs mt-1">Try refining your search filters</p>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const displayedTransactions = enablePagination
    ? transactions.slice(startIndex, endIndex)
    : transactions;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Category</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Currency</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</th>
              {onEdit && <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {displayedTransactions.map((tx, i) => {
              const status = statusConfig[tx.status];
              const StatusIcon = status.icon;
              const isCredit = tx.type === 'credit';

              return (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className={`inline-flex items-center gap-1.5 ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isCredit ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      <span className="capitalize text-xs font-medium">{tx.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-[200px] truncate">{tx.description}</td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    {tx.category ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryStyle(tx.category)}`}>
                        {tx.category}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">-</span>
                    )}
                  </td>
                  <td className={`py-3 px-4 text-right font-mono font-medium ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isCredit ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                  </td>
                  <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">{tx.currency}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className={`${status.color} text-xs gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs hidden md:table-cell">{formatDate(tx.created_at)}</td>
                  {onEdit && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800/50 transition-colors"
                        title="Edit transaction"
                      >
                        <Pencil className="h-3.5 w-3.5 text-[#7C3AED]" />
                      </button>
                    </td>
                  )}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {enablePagination && totalItems > 0 && (
        <CustomPagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          itemsPerPageOptions={[5, 10, 20, 50]}
          itemName="transactions"
          syncWithUrl={true}
          urlParamName="tx_page"
        />
      )}
    </div>
  );
}

