import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid } from 'recharts';
import type { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';
import { CustomPagination } from '@/components/ui/CustomPagination';

interface AnalyticsProps {
  transactions: Transaction[];
}

const COLORS = {
  credit: '#34d399',
  debit: '#f43f5e',
  income: '#10b981',
  expense: '#ef4444',
};

const CATEGORY_COLORS = [
  '#7C3AED', // Purple
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#06B6D4', // Cyan
  '#8B5CF6', // Violet
  '#64748B', // Slate
];

const STATUS_COLORS = {
  completed: '#34d399',
  pending: '#fbbf24',
  failed: '#f43f5e',
};

export function Analytics({ transactions }: AnalyticsProps) {
  const [cashFlowPage, setCashFlowPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  
  const cashFlowItemsPerPage = 10;
  const categoryItemsPerPage = 5;

  const txCountByStatus = useMemo(() => {
    const counts: Record<string, number> = { completed: 0, pending: 0, failed: 0 };
    transactions.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: STATUS_COLORS[name as keyof typeof STATUS_COLORS],
    }));
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { credits: number; debits: number }> = {};
    transactions.forEach((t) => {
      const key = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!months[key]) months[key] = { credits: 0, debits: 0 };
      if (t.type === 'credit') months[key].credits += Number(t.amount);
      else months[key].debits += Number(t.amount);
    });
    return Object.entries(months).map(([month, data]) => ({ month, ...data }));
  }, [transactions]);

  // Compute category spending (debits only)
  const categorySpending = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.type === 'debit' && t.status === 'completed') {
        const cat = t.category || 'Other';
        categories[cat] = (categories[cat] || 0) + Number(t.amount);
      }
    });
    return Object.entries(categories)
      .map(([name, value], index) => ({
        name,
        value,
        fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalCategorySpend = useMemo(() => {
    return categorySpending.reduce((sum, c) => sum + c.value, 0);
  }, [categorySpending]);

  const paginatedCategories = useMemo(() => {
    const start = (categoryPage - 1) * categoryItemsPerPage;
    return categorySpending.slice(start, start + categoryItemsPerPage);
  }, [categorySpending, categoryPage]);

  // Compute recent daily cash flow (past 10 dates, now paginated!)
  const sortedDailyCashFlow = useMemo(() => {
    const days: Record<string, { Income: number; Spending: number }> = {};
    transactions.forEach((t) => {
      if (t.status !== 'completed') return;
      const key = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!days[key]) days[key] = { Income: 0, Spending: 0 };
      if (t.type === 'credit') days[key].Income += Number(t.amount);
      else days[key].Spending += Number(t.amount);
    });
    
    return Object.entries(days)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  const displayedDailyCashFlow = useMemo(() => {
    const start = (cashFlowPage - 1) * cashFlowItemsPerPage;
    return sortedDailyCashFlow.slice(start, start + cashFlowItemsPerPage);
  }, [sortedDailyCashFlow, cashFlowPage]);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <p className="text-sm">No analytics data yet. Add transactions to see charts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Monthly Bar & Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Credits vs Debits */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Monthly Credits vs Debits</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val) => formatCurrency(Number(val))}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                />
                <Bar dataKey="credits" fill={COLORS.credit} radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="debits" fill={COLORS.debit} radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Status Distribution */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Transaction Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={txCountByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {txCountByStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Category Spend & Daily Cash Flow Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spend breakdown */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categorySpending.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-xs text-slate-500">
                No expense transactions found for category breakdown.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={categorySpending} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(val) => formatCurrency(Number(val))}
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#e2e8f0',
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {categorySpending.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Paginated list breakdown */}
                <div className="flex flex-col justify-between min-h-[240px]">
                  <div className="space-y-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block">
                      Category Detail List
                    </span>
                    <div className="space-y-3.5">
                      {paginatedCategories.map((c) => {
                        const pct = totalCategorySpend > 0 ? (c.value / totalCategorySpend) * 100 : 0;
                        return (
                          <div key={c.name} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-semibold">
                              <span className="text-slate-300 font-bold">{c.name}</span>
                              <span className="text-slate-400 font-mono">
                                {formatCurrency(c.value)} ({pct.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${pct}%`, backgroundColor: c.fill }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {categorySpending.length > categoryItemsPerPage && (
                    <CustomPagination
                      currentPage={categoryPage}
                      totalItems={categorySpending.length}
                      itemsPerPage={categoryItemsPerPage}
                      onPageChange={setCategoryPage}
                      itemName="categories"
                      syncWithUrl={true}
                      urlParamName="cat_page"
                    />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Cash Flow trend area */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Daily Cash Flow (Income vs Spend)</CardTitle>
          </CardHeader>
          <CardContent>
            {displayedDailyCashFlow.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-xs text-slate-500">
                No daily transaction activity to display cash flow.
              </div>
            ) : (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={displayedDailyCashFlow}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.income} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={COLORS.income} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.expense} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={COLORS.expense} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val) => formatCurrency(Number(val))}
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#e2e8f0',
                      }}
                    />
                    <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{value}</span>} />
                    <Area type="monotone" dataKey="Income" stroke={COLORS.income} fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Spending" stroke={COLORS.expense} fillOpacity={1} fill="url(#colorSpending)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
                
                {sortedDailyCashFlow.length > cashFlowItemsPerPage && (
                  <CustomPagination
                    currentPage={cashFlowPage}
                    totalItems={sortedDailyCashFlow.length}
                    itemsPerPage={cashFlowItemsPerPage}
                    onPageChange={setCashFlowPage}
                    itemName="days"
                    syncWithUrl={true}
                    urlParamName="cf_page"
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
