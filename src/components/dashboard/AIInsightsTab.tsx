import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Sparkles, TrendingUp, ShieldAlert, CheckCircle2, X, AlertTriangle, Bot, HelpCircle } from 'lucide-react';
import type { Transaction } from '@/types';
import { formatCurrency } from '@/utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface AIInsightsTabProps {
  transactions: Transaction[];
  onFreezeCard: () => void;
  onNavigateSection: (section: string) => void;
}

export function AIInsightsTab({ onFreezeCard }: AIInsightsTabProps) {
  const { toast } = useToast();
  const [typingText, setTypingText] = useState('');
  const [canceledSubs, setCanceledSubs] = useState<string[]>([]);
  const [verifiedFraud, setVerifiedFraud] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [savingsChecked, setSavingsChecked] = useState<Record<string, boolean>>({
    sub: false,
    yield: false,
    dining: false,
  });

  const fullSummaryText = "Good evening, Pratvi. Your VaultAI analysis is ready. This month you saved 14% more than last month. However, subscription spend is up 32%. We recommend reviewing your subscription checklist. Additionally, an unusual Stripe transaction was flagged.";

  // Typing effect simulation
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypingText((prev) => prev + fullSummaryText.charAt(index));
      index++;
      if (index >= fullSummaryText.length) {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, []);

  // Compute active subscriptions from transactions
  const activeSubs = [
    { name: 'Netflix Premium', amount: 15.99, id: 'netflix', date: 'Monthly on 27th' },
    { name: 'Equinox Gym Membership', amount: 45.00, id: 'equinox', date: 'Monthly on 24th' },
    { name: 'OpenAI ChatGPT Subscription', amount: 20.00, id: 'openai', date: 'Monthly on 5th' },
    { name: 'Spotify Premium Music Family', amount: 12.00, id: 'spotify', date: 'Monthly on 2nd' },
  ].filter(sub => !canceledSubs.includes(sub.id));

  // Smart Forecast Data (Recharts)
  const forecastData = [
    { date: 'May 1', Actual: 15400, Forecast: 15400 },
    { date: 'May 5', Actual: 16100, Forecast: 16100 },
    { date: 'May 10', Actual: 15900, Forecast: 15900 },
    { date: 'May 15', Actual: 17200, Forecast: 17200 },
    { date: 'May 20', Actual: 18100, Forecast: 18150 },
    { date: 'May 23', Actual: 18899, Forecast: 18899 },
    // Dotted projection line starts here
    { date: 'May 25', Actual: null, Forecast: 19100 },
    { date: 'May 28', Actual: null, Forecast: 19450 },
    { date: 'Jun 1', Actual: null, Forecast: 22100 }, // Salary projection
    { date: 'Jun 5', Actual: null, Forecast: 21850 },
  ];

  const handleCancelSub = (subName: string, id: string) => {
    setCanceledSubs(prev => [...prev, id]);
    toast({
      title: 'Subscription Cancel Request Sent',
      description: `VaultAI has generated a cancellation draft for ${subName}. Subscription is now frozen.`,
    });
  };

  const handleVerifyFraud = () => {
    setVerifiedFraud(true);
    toast({
      title: 'Dispute Case Filed',
      description: 'The Stripe charge has been flagged as fraud. Reversing transaction...',
    });
  };

  const toggleSavingsCheck = (id: string, label: string) => {
    setSavingsChecked(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      if (updated[id]) {
        toast({
          title: 'Action Completed',
          description: label,
        });
      }
      return updated;
    });
  };

  // Score breakdown counts
  const scoreBreakdowns = [
    { label: 'Savings Rate', score: 'Excellent', color: 'text-emerald-400' },
    { label: 'Recurring Subscriptions', score: 'High Spend', color: 'text-amber-400' },
    { label: 'Dining / Food Limit', score: 'Borderline', color: 'text-amber-400' },
    { label: 'Account Security', score: '1 Alert', color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-purple-650/20 p-2 rounded-xl border border-purple-500/20 text-purple-400">
            <Sparkles className="h-5 w-5 animate-pulse text-yellow-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">VaultAI Intelligence Center</h2>
            <p className="text-sm text-slate-400 mt-1">Deep spending insights, balance predictions, and suggestions</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowHelp(true)}
          className="p-2 rounded-xl border border-purple-550/20 bg-purple-500/5 hover:bg-purple-650 hover:text-white text-purple-400 transition-all flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-sm"
          title="VaultAI Guide"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Guide</span>
        </button>
      </div>

      {/* Main Grid: Health Score + AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* radial Health Score Ring */}
        <Card className="bg-slate-900/50 border-slate-800 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wider">VaultScore</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-6 space-y-5">
            {/* Radial Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Gradient Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-purple-650"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * 82) / 100} // 82/100 filled
                  strokeLinecap="round"
                />
              </svg>
              {/* Inner score texts */}
              <div className="absolute text-center">
                <span className="text-3xl font-black text-white tracking-tighter">82</span>
                <span className="text-xs text-slate-500 block font-semibold">/100</span>
              </div>
            </div>

            {/* Sub score breakdown */}
            <div className="w-full space-y-2 pt-2 border-t border-slate-850">
              {scoreBreakdowns.map((b) => (
                <div key={b.label} className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">{b.label}</span>
                  <span className={b.color}>{b.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Typed Executive Summary */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-white via-purple-50/10 to-indigo-50/10 dark:from-slate-900/60 dark:to-purple-950/15 border-purple-500/20 backdrop-blur-sm relative flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-400 animate-pulse" />
              <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200">VaultAI Executive Report</CardTitle>
            </div>
            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              LIVE REPORT
            </span>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between p-6">
            <div className="min-h-[96px] bg-purple-50/40 dark:bg-slate-950/40 p-4 border border-purple-100 dark:border-slate-850 rounded-xl">
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-mono">
                {typingText}
                <span className="inline-block w-1.5 h-4 bg-purple-400 ml-0.5 animate-pulse" />
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 pt-4">
              <div className="bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Savings optimized +14%
              </div>
              <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Dining cap exceeded
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Warning Banner Widget */}
      {!verifiedFraud && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-50 via-white to-red-50/50 dark:from-red-950/30 dark:via-slate-900/60 dark:to-red-950/15 p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-red-500"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="bg-red-500/20 p-2.5 rounded-xl border border-red-500/30 text-red-400 shrink-0">
              <ShieldAlert className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                Anomalous Charge Detected
                <span className="text-[9px] bg-red-500/20 border border-red-500/30 px-1.5 py-0.5 rounded font-black text-red-400 uppercase tracking-widest">
                  High Risk
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Stripe Merchant attempted a transaction of <strong className="text-slate-900 dark:text-white">$340.00</strong> from an unknown device in Paris, France.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 self-end sm:self-auto shrink-0">
            <button
              onClick={onFreezeCard}
              className="text-xs font-bold bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500 transition-colors shadow-sm"
            >
              Freeze Card
            </button>
            <button
              onClick={handleVerifyFraud}
              className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg border border-red-700 shadow-md transition-colors"
            >
              Dispute Transaction
            </button>
          </div>
        </motion.div>
      )}

      {/* Grid: Forecast + Subscriptions + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Chart */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-200">VaultAI Month-End Balance Prediction</CardTitle>
            <p className="text-xs text-slate-400">Actual balance trend vs predicted balance flow (dotted line)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b0f19',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                />
                <Legend formatter={(value) => <span className="text-xs text-slate-400">{value}</span>} />
                <Line
                  type="monotone"
                  dataKey="Actual"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#3b82f6' }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="Forecast"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2, fill: '#a855f7' }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Smart savings recommendations checklist */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-200">AI Savings Recommendations</CardTitle>
            <p className="text-xs text-slate-400">Implement actions to reach your budget goals</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {/* Option 1 */}
              <div
                onClick={() => toggleSavingsCheck('sub', 'Subscription budget review complete.')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 items-start ${
                  savingsChecked.sub
                    ? 'bg-purple-950/5 border-purple-500/20 opacity-60'
                    : 'bg-slate-950 border-slate-850 hover:border-purple-500/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={savingsChecked.sub}
                  onChange={() => {}} // handled by div click
                  className="mt-1 cursor-pointer accent-purple-500 shrink-0"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white leading-normal">Cancel unused subscriptions</p>
                  <p className="text-[10px] text-slate-400">Review Netflix and Gym spending below.</p>
                </div>
              </div>

              {/* Option 2 */}
              <div
                onClick={() => toggleSavingsCheck('yield', 'Allocated $300 to VaultSavings.')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 items-start ${
                  savingsChecked.yield
                    ? 'bg-purple-950/5 border-purple-500/20 opacity-60'
                    : 'bg-slate-950 border-slate-850 hover:border-purple-500/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={savingsChecked.yield}
                  onChange={() => {}}
                  className="mt-1 cursor-pointer accent-purple-500 shrink-0"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white leading-normal">Move $300 to VaultSavings</p>
                  <p className="text-[10px] text-slate-400">Earn 5.2% APY compound interest instantly.</p>
                </div>
              </div>

              {/* Option 3 */}
              <div
                onClick={() => toggleSavingsCheck('dining', 'Dining budget limits established.')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 items-start ${
                  savingsChecked.dining
                    ? 'bg-purple-950/5 border-purple-500/20 opacity-60'
                    : 'bg-slate-950 border-slate-850 hover:border-purple-500/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={savingsChecked.dining}
                  onChange={() => {}}
                  className="mt-1 cursor-pointer accent-purple-500 shrink-0"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white leading-normal">Reduce dining spend by 12%</p>
                  <p className="text-[10px] text-slate-400">Avoid restaurant dinner surges this week.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Detection Checklist */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-200">Active Subscription Detection</CardTitle>
            <p className="text-xs text-slate-400">VaultAI scans transaction history to isolate monthly recurring bills</p>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
            {activeSubs.length} DETECTED
          </span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeSubs.length === 0 ? (
              <div className="col-span-full py-6 text-center text-slate-500">
                <CheckCircle2 className="h-8 w-8 text-emerald-400/50 mx-auto mb-2" />
                <p className="text-xs font-bold">All detected subscriptions canceled!</p>
              </div>
            ) : (
              activeSubs.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-white">{sub.name}</h5>
                    <p className="text-[10px] text-slate-500 font-medium">{sub.date}</p>
                    <p className="text-sm font-black text-purple-400 pt-1">
                      {formatCurrency(sub.amount)}
                      <span className="text-[9px] text-slate-500 font-normal">/mo</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancelSub(sub.name, sub.id)}
                    className="w-full text-center text-[10px] font-bold bg-purple-500/10 border border-purple-500/20 hover:bg-purple-650 hover:text-white text-purple-300 py-1.5 rounded-lg transition-colors"
                  >
                    Cancel via VaultAI
                  </button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Guide Help Overlay Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-400">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">VaultAI User Guide</h3>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs sm:text-sm text-slate-300">
                <p className="leading-relaxed">
                  Welcome to your VaultAI dashboard! This assistant leverages local heuristics to parse your cash flow, evaluate budget targets, and highlight potential risks.
                </p>
                
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-purple-950/20 border border-purple-500/10 rounded-xl space-y-1">
                    <h5 className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      VaultScore (radial chart)
                    </h5>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      A scoring index evaluating your financial wellness from 0 to 100. It updates dynamically as you complete savings recommendations, cancel recurring subscriptions, and secure card limits.
                    </p>
                  </div>

                  <div className="p-3 bg-purple-950/20 border border-purple-500/10 rounded-xl space-y-1">
                    <h5 className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      Month-End Predictions
                    </h5>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      The dotted projection displays a machine-learning simulated forecast of your net balance. It calculates your daily spending velocity against upcoming recurring payments.
                    </p>
                  </div>

                  <div className="p-3 bg-purple-950/20 border border-purple-500/10 rounded-xl space-y-1">
                    <h5 className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      Subscription cancellations
                    </h5>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Click "Cancel via VaultAI" to draft a cancellation request. This notifies our simulated system to stop card authorizations, updating your health score instantly.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-6 py-3 bg-slate-850 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowHelp(false)}
                  className="bg-purple-650 hover:bg-purple-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition-colors"
                >
                  Got it, thanks!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
