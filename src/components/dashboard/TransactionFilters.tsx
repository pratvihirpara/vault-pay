import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TransactionFilters } from '@/types';

interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  onFilterChange: (filters: TransactionFilters) => void;
}

export function TransactionFiltersBar({ filters, onFilterChange }: TransactionFiltersBarProps) {
  const updateFilter = (key: keyof TransactionFilters, value: string) => {
    onFilterChange({ ...filters, [key]: value === 'all' ? undefined : value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={filters.type || 'all'} onValueChange={(v) => updateFilter('type', v)}>
        <SelectTrigger className="w-[130px] bg-slate-800/50 border-slate-700 text-slate-300 text-xs">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          <SelectItem value="all" className="text-slate-300 text-xs">All Types</SelectItem>
          <SelectItem value="credit" className="text-slate-300 text-xs">Credit</SelectItem>
          <SelectItem value="debit" className="text-slate-300 text-xs">Debit</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.status || 'all'} onValueChange={(v) => updateFilter('status', v)}>
        <SelectTrigger className="w-[140px] bg-slate-800/50 border-slate-700 text-slate-300 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          <SelectItem value="all" className="text-slate-300 text-xs">All Status</SelectItem>
          <SelectItem value="completed" className="text-slate-300 text-xs">Completed</SelectItem>
          <SelectItem value="pending" className="text-slate-300 text-xs">Pending</SelectItem>
          <SelectItem value="failed" className="text-slate-300 text-xs">Failed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.currency || 'all'} onValueChange={(v) => updateFilter('currency', v)}>
        <SelectTrigger className="w-[130px] bg-slate-800/50 border-slate-700 text-slate-300 text-xs">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          <SelectItem value="all" className="text-slate-300 text-xs">All Currencies</SelectItem>
          <SelectItem value="USD" className="text-slate-300 text-xs">USD</SelectItem>
          <SelectItem value="EUR" className="text-slate-300 text-xs">EUR</SelectItem>
          <SelectItem value="GBP" className="text-slate-300 text-xs">GBP</SelectItem>
          <SelectItem value="INR" className="text-slate-300 text-xs">INR</SelectItem>
          <SelectItem value="JPY" className="text-slate-300 text-xs">JPY</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
