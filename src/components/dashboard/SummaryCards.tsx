import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import type { WalletSummary } from '@/types';
import { formatCurrency } from '@/utils/format';
import { Skeleton } from '@/components/ui/skeleton';

interface SummaryCardsProps {
  summary: WalletSummary | null;
  loading: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Total Balance',
      value: summary ? formatCurrency(summary.balance) : '$0.00',
      icon: Wallet,
      color: 'blue',
      bgGradient: 'from-blue-600/20 to-blue-800/10',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Total Credits',
      value: summary ? formatCurrency(summary.totalCredits) : '$0.00',
      icon: TrendingUp,
      color: 'emerald',
      bgGradient: 'from-emerald-600/20 to-emerald-800/10',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Total Debits',
      value: summary ? formatCurrency(summary.totalDebits) : '$0.00',
      icon: TrendingDown,
      color: 'rose',
      bgGradient: 'from-rose-600/20 to-rose-800/10',
      iconBg: 'bg-rose-500/20',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-500/20',
    },
    {
      title: 'Total Transactions',
      value: summary?.totalTransactions?.toString() ?? '0',
      icon: ArrowLeftRight,
      color: 'amber',
      bgGradient: 'from-amber-600/20 to-amber-800/10',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className={`rounded-xl border ${card.borderColor} bg-gradient-to-br ${card.bgGradient} p-6 backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {card.title}
            </span>
            <div className={`${card.iconBg} p-2 rounded-lg`}>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            {card.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
