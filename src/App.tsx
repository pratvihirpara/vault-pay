import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Users, Activity, Clock, Sparkles } from 'lucide-react';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { TransactionFiltersBar } from '@/components/dashboard/TransactionFilters';
import { AddTransactionModal } from '@/components/dashboard/AddTransactionModal';
import { EditTransactionModal } from '@/components/dashboard/EditTransactionModal';
import { Analytics } from '@/components/dashboard/Analytics';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginPage } from '@/components/auth/LoginPage';
import { SettingsSection } from '@/components/dashboard/SettingsSection';
import { supabase } from '@/lib/supabase';

import { getWalletSummary, getTransactions, createTransaction, updateTransaction } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { Transaction, WalletSummary, TransactionFilters, CreateTransactionInput, CardData, NotificationItem } from '@/types';
import { formatCurrency } from '@/utils/format';
import { VirtualCard } from '@/components/dashboard/VirtualCard';
import { VaultAIChat } from '@/components/dashboard/VaultAIChat';
import { AIInsightsTab } from '@/components/dashboard/AIInsightsTab';
import { LandingPage } from '@/components/layout/LandingPage';

interface UserAccount {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

function App() {
  const [user, setUser] = useState<UserAccount | null>(() => {
    const stored = localStorage.getItem('fintech_logged_in_user_obj') || sessionStorage.getItem('fintech_logged_in_user_obj');
    return stored ? JSON.parse(stored) : null;
  });
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authFormTab, setAuthFormTab] = useState<'login' | 'signup'>('login');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Cards State
  const [cards, setCards] = useState<CardData[]>(() => {
    const stored = localStorage.getItem('fintech_user_cards');
    if (stored) return JSON.parse(stored);
    
    const initialCards: CardData[] = [
      {
        id: 'card-1',
        type: 'virtual',
        cardNumber: '4125 5679 9989 7889',
        cardHolder: 'Pratvi',
        expiryDate: '06/27',
        cvv: '321',
        balance: 18899.19,
        limit: 15000,
        isFrozen: false,
        colorScheme: 'violet-glowing',
        brand: 'mastercard',
      },
      {
        id: 'card-2',
        type: 'virtual',
        cardNumber: '4144 7079 2409 0067',
        cardHolder: 'Pratvi',
        expiryDate: '09/27',
        cvv: '564',
        balance: 11459.39,
        limit: 8000,
        isFrozen: false,
        colorScheme: 'pastel-spiral',
        brand: 'visa',
      },
      {
        id: 'card-3',
        type: 'physical',
        cardNumber: '4532 9011 8823 4410',
        cardHolder: 'Pratvi',
        expiryDate: '12/28',
        cvv: '109',
        balance: 5240.00,
        limit: 5000,
        isFrozen: true,
        colorScheme: 'dark-stripe',
        brand: 'visa',
      }
    ];
    localStorage.setItem('fintech_user_cards', JSON.stringify(initialCards));
    return initialCards;
  });

  const [selectedDashboardCardIdx, setSelectedDashboardCardIdx] = useState(0);

  // Keep localStorage updated when cards update
  useEffect(() => {
    localStorage.setItem('fintech_user_cards', JSON.stringify(cards));
  }, [cards]);

  const handleFreezeToggle = (cardId: string) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFrozen: !c.isFrozen } : c));
    const card = cards.find(c => c.id === cardId);
    toast({
      title: 'Card Status Updated',
      description: `Card ending in ${card?.cardNumber.slice(-4)} has been successfully ${card?.isFrozen ? 'unfrozen' : 'frozen'}.`,
    });
  };

  const handleLimitChange = (cardId: string, limit: number) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, limit } : c));
  };

  const handleCreateCard = (type: 'virtual' | 'physical', brand: 'visa' | 'mastercard', colorScheme: 'violet-glowing' | 'pastel-spiral' | 'dark-stripe', balance: number, limit: number) => {
    const generateNum = () => {
      const part = () => Math.floor(1000 + Math.random() * 9000).toString();
      return `${part()} ${part()} ${part()} ${part()}`;
    };
    
    const newCard: CardData = {
      id: `card-${Date.now()}`,
      type,
      brand,
      cardNumber: generateNum(),
      cardHolder: user?.name || 'Pratvi',
      expiryDate: `${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getFullYear() + 4).slice(-2)}`,
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      balance,
      limit,
      isFrozen: false,
      colorScheme,
    };
    
    setCards(prev => [...prev, newCard]);
    toast({
      title: 'New Card Issued',
      description: `Your new ${type} ${brand.toUpperCase()} card has been created.`,
    });
  };

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const stored = localStorage.getItem('fintech_notifications');
    if (stored) return JSON.parse(stored);
    
    const initialNotifications: NotificationItem[] = [
      {
        id: 'notif-1',
        type: 'security',
        title: 'Suspicious Activity Flagged',
        message: 'A transaction of $340 at Stripe Merchant was declined from an unknown device.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: false,
        actionSection: 'ai-insights',
      },
      {
        id: 'notif-2',
        type: 'insight',
        title: 'Unusual Restaurant Spending',
        message: 'You spent 32% more on subscriptions and dining out this week.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: false,
        actionSection: 'ai-insights',
      },
      {
        id: 'notif-3',
        type: 'tip',
        title: 'Smart Savings Tip',
        message: 'Move $300 to VaultSavings to unlock 5.2% APY and save $48/month.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        read: true,
        actionSection: 'wallet',
      }
    ];
    localStorage.setItem('fintech_notifications', JSON.stringify(initialNotifications));
    return initialNotifications;
  });

  useEffect(() => {
    localStorage.setItem('fintech_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: 'Notifications Cleared',
      description: 'All notifications have been removed.',
    });
  };

  // Initialize dark mode from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
    if (!hasSupabase) return;

    // Retrieve initial Supabase session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userInfo: UserAccount = {
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Google User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'user'
        };
        setUser(userInfo);
        localStorage.setItem('fintech_logged_in_user_obj', JSON.stringify(userInfo));
      }
    });

    // Listen for real-time authentication state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        const userInfo: UserAccount = {
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Google User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'user'
        };
        setUser(userInfo);
        localStorage.setItem('fintech_logged_in_user_obj', JSON.stringify(userInfo));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('fintech_logged_in_user_obj');
        sessionStorage.removeItem('fintech_logged_in_user_obj');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, txData] = await Promise.all([
        getWalletSummary(),
        getTransactions(filters),
      ]);
      setSummary(summaryData);
      setTransactions(txData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(tx =>
      tx.description.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  const handleCreateTransaction = async (input: CreateTransactionInput) => {
    try {
      await createTransaction(input);
      toast({ title: 'Transaction created', description: `${input.type} of ${input.amount} ${input.currency}` });
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create transaction';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      throw err;
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditModalOpen(true);
  };

  const handleUpdateTransaction = async (id: string, data: Partial<Transaction>) => {
    try {
      await updateTransaction(id, data);
      toast({ title: 'Transaction updated', description: 'Changes saved successfully.' });
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update transaction';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      throw err;
    }
  };

  const handleUpdateUser = (updatedUser: Partial<{ name: string; email: string; role: 'user' | 'admin' }>) => {
    if (!user) return;
    const updated = { ...user, ...updatedUser };
    setUser(updated);
    const stored = localStorage.getItem('fintech_logged_in_user_obj');
    if (stored) {
      localStorage.setItem('fintech_logged_in_user_obj', JSON.stringify(updated));
    } else {
      sessionStorage.setItem('fintech_logged_in_user_obj', JSON.stringify(updated));
    }
  };

  const AdminDashboardSection = () => {
    const totalVolume = useMemo(() => {
      return transactions.reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);

    const userCount = useMemo(() => {
      const stored = localStorage.getItem('fintech_registered_users');
      if (stored) {
        return (JSON.parse(stored) as any[]).length;
      }
      return 2;
    }, []);

    return (
      <div className="space-y-6">
        {/* Admin Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">System Volume</span>
              <div className="bg-[#7C3AED]/10 p-2 rounded-lg"><Wallet className="h-4 w-4 text-[#7C3AED]" /></div>
            </div>
            <div className="text-2xl font-bold text-slate-800 tracking-tight">{formatCurrency(totalVolume)}</div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Registrations</span>
              <div className="bg-blue-500/10 p-2 rounded-lg"><Users className="h-4 w-4 text-blue-600" /></div>
            </div>
            <div className="text-2xl font-bold text-slate-800 tracking-tight">{userCount} Users</div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">System Health</span>
              <div className="bg-emerald-500/10 p-2 rounded-lg flex items-center justify-center"><Activity className="h-4 w-4 text-emerald-600 animate-pulse" /></div>
            </div>
            <div className="text-2xl font-bold text-slate-800 tracking-tight">99.98%</div>
          </div>

          <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average Latency</span>
              <div className="bg-amber-500/10 p-2 rounded-lg"><Clock className="h-4 w-4 text-amber-600" /></div>
            </div>
            <div className="text-2xl font-bold text-slate-800 tracking-tight">18ms</div>
          </div>
        </div>

        {/* Global Recent Audit log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base font-semibold text-slate-800">System Audit Log</CardTitle>
                <span className="text-xs font-bold text-[#7C3AED] bg-[#7C3AED]/5 px-2.5 py-0.5 rounded-full">REALTIME AUDITING</span>
              </CardHeader>
              <CardContent>
                <TransactionTable transactions={transactions.slice(0, 8)} loading={loading} />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-slate-800">Auditor Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                  <p className="text-xs font-bold text-purple-700">Security Credentials Validated</p>
                  <p className="text-[10px] text-purple-500 mt-1">Logged in as {user?.name} ({user?.role.toUpperCase()})</p>
                </div>
                <div className="space-y-2.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Node Location</span>
                    <span className="text-slate-700">in-mumbai-01</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">SSL Status</span>
                    <span className="text-emerald-600">Active</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Database Engine</span>
                    <span className="text-slate-700">Supabase Edge Local</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Analytics transactions={transactions} />
      </div>
    );
  };

  const UserManagerSection = () => {
    const [userList, setUserList] = useState<UserAccount[]>([]);

    const fetchUsers = () => {
      const stored = localStorage.getItem('fintech_registered_users');
      if (stored) {
        setUserList(JSON.parse(stored));
      }
    };

    useEffect(() => {
      fetchUsers();
    }, []);

    const updateUserRole = (email: string, newRole: 'user' | 'admin') => {
      const stored = localStorage.getItem('fintech_registered_users');
      if (stored) {
        const users = JSON.parse(stored) as any[];
        const updated = users.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, role: newRole } : u);
        localStorage.setItem('fintech_registered_users', JSON.stringify(updated));
        setUserList(updated);
        toast({ title: 'Success', description: `User role updated to ${newRole.toUpperCase()}.` });
      }
    };

    const deleteUser = (email: string) => {
      if (email.toLowerCase() === user?.email.toLowerCase()) {
        toast({ title: 'Error', description: 'You cannot delete your own admin account!', variant: 'destructive' });
        return;
      }
      const stored = localStorage.getItem('fintech_registered_users');
      if (stored) {
        const users = JSON.parse(stored) as any[];
        const updated = users.filter(u => u.email.toLowerCase() !== email.toLowerCase());
        localStorage.setItem('fintech_registered_users', JSON.stringify(updated));
        setUserList(updated);
        toast({ title: 'Success', description: 'User account has been deleted.' });
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-500 mt-1">Review, promote, and manage registered system accounts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userList.map((u) => (
            <Card key={u.email} className="bg-slate-900/50 border-slate-800 relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-[#7C3AED] font-bold">
                    {u.name.charAt(0)}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    u.role === 'admin' ? 'bg-purple-100 text-[#7C3AED]' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role.toUpperCase()}
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-slate-800 mt-3">{u.name}</CardTitle>
                <p className="text-xs text-slate-500 truncate">{u.email}</p>
              </CardHeader>
              <CardContent className="pt-4 border-t border-slate-100/50 flex gap-2">
                {u.role === 'user' ? (
                  <button
                    onClick={() => updateUserRole(u.email, 'admin')}
                    className="flex-1 bg-purple-50 hover:bg-purple-100 text-[#7C3AED] font-bold py-1.5 px-3 rounded-lg text-xs transition-colors"
                  >
                    Promote to Admin
                  </button>
                ) : (
                  <button
                    onClick={() => updateUserRole(u.email, 'user')}
                    disabled={u.email.toLowerCase() === user?.email.toLowerCase()}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors"
                  >
                    Demote to User
                  </button>
                )}
                <button
                  onClick={() => deleteUser(u.email)}
                  disabled={u.email.toLowerCase() === user?.email.toLowerCase()}
                  className="bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors"
                >
                  Delete
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderSection = () => {
    if (activeSection === 'users' && user?.role !== 'admin') {
      return <DashboardSection />;
    }

    switch (activeSection) {
      case 'dashboard':
        return user?.role === 'admin' ? <AdminDashboardSection /> : <DashboardSection />;
      case 'transactions':
        return <TransactionsSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'ai-insights':
        return <AIInsightsTab transactions={transactions} onFreezeCard={() => handleFreezeToggle('card-1')} onNavigateSection={setActiveSection} />;
      case 'users':
        return <UserManagerSection />;
      case 'wallet':
        return <WalletSection />;
      case 'settings':
        return <SettingsSectionWrapper />;
      default:
        return <DashboardSection />;
    }
  };

  const DashboardSection = () => (
    <div className="space-y-6">
      {/* AI Insight banner at top of dashboard */}
      <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-100 to-indigo-50/50 dark:from-purple-900/40 dark:via-indigo-950/30 dark:to-slate-900/60 p-4 backdrop-blur-sm shadow-md flex items-center justify-between gap-4 border-l-4 border-l-purple-500 animate-pulse-subtle">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/10 dark:bg-purple-500/20 p-2.5 rounded-lg border border-purple-500/20 dark:border-purple-500/30 text-purple-600 dark:text-purple-400">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-purple-600 dark:text-purple-300 uppercase tracking-wider">VaultAI Spending Insight</h4>
            <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5">
              Unusual activity detected: subscription spending is up <strong>32%</strong>. Move $300 to savings to optimize your budget.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveSection('ai-insights')}
          className="shrink-0 text-xs font-bold bg-[#7C3AED]/10 hover:bg-[#7C3AED] text-[#7C3AED] hover:text-white dark:bg-[#7C3AED]/20 dark:hover:bg-[#7C3AED] dark:text-purple-300 dark:hover:text-white px-3.5 py-1.5 rounded-lg border border-purple-500/30 transition-all"
        >
          View Recommendations
        </button>
      </div>

      <SummaryCards summary={summary} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-semibold text-slate-200">Recent Transactions</CardTitle>
              <AddTransactionModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSubmit={handleCreateTransaction}
                currentBalance={summary?.balance ?? 0}
              />
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={filteredTransactions.slice(0, 8)} loading={loading} onEdit={handleEditTransaction} />
            </CardContent>
          </Card>

          <Analytics transactions={transactions} />
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold text-slate-200">My Cards</CardTitle>
              <button
                onClick={() => setActiveSection('wallet')}
                className="text-xs font-semibold text-purple-400 hover:underline"
              >
                Manage
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {cards.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Quick View</span>
                    <div className="flex gap-1.5">
                      {cards.map((c, idx) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedDashboardCardIdx(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            selectedDashboardCardIdx === idx ? 'bg-purple-500 w-4' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <VirtualCard
                    card={cards[selectedDashboardCardIdx] || cards[0]}
                    onFreezeToggle={handleFreezeToggle}
                    onLimitChange={handleLimitChange}
                    isDetailed={false}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-slate-200">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivity transactions={transactions} enablePagination={true} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const TransactionsSection = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">All Transactions</h2>
          <p className="text-sm text-slate-400 mt-1">Manage and review your transaction history</p>
        </div>
        <AddTransactionModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSubmit={handleCreateTransaction}
          currentBalance={summary?.balance ?? 0}
        />
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-sm font-medium text-slate-400">Filters</CardTitle>
          <TransactionFiltersBar filters={filters} onFilterChange={setFilters} />
        </CardHeader>
        <CardContent>
          <TransactionTable transactions={filteredTransactions} loading={loading} onEdit={handleEditTransaction} enablePagination={true} />
        </CardContent>
      </Card>
    </div>
  );

  const AnalyticsSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Analytics</h2>
        <p className="text-sm text-slate-400 mt-1">Visualize your financial data</p>
      </div>
      <Analytics transactions={transactions} />
    </div>
  );

  const WalletSection = () => {
    const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id || 'card-1');
    const [newCardType, setNewCardType] = useState<'virtual' | 'physical'>('virtual');
    const [newCardBrand, setNewCardBrand] = useState<'visa' | 'mastercard'>('visa');
    const [newCardColor, setNewCardColor] = useState<'violet-glowing' | 'pastel-spiral' | 'dark-stripe'>('violet-glowing');
    const [newCardLimit, setNewCardLimit] = useState(5000);
    const [newCardBalance, setNewCardBalance] = useState(1000);

    const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Wallet & Cards</h2>
          <p className="text-sm text-slate-400 mt-1">Manage physical and virtual cards and balances</p>
        </div>

        <SummaryCards summary={summary} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-200">Your Cards</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">Select a card to adjust limits, freeze status, or view full details</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800">
                  {cards.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCardId(c.id)}
                      className={`shrink-0 cursor-pointer p-1 rounded-2xl transition-all ${
                        selectedCardId === c.id
                          ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-950 scale-[0.98]'
                          : 'hover:scale-[0.99] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="pointer-events-none">
                        <VirtualCard card={c} onFreezeToggle={() => {}} onLimitChange={() => {}} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-200">Issue New Card</CardTitle>
                <p className="text-xs text-slate-400">Instantly generate virtual or physical payment cards</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Card Type</label>
                    <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                      <button
                        onClick={() => setNewCardType('virtual')}
                        className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors ${
                          newCardType === 'virtual' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Virtual
                      </button>
                      <button
                        onClick={() => setNewCardType('physical')}
                        className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors ${
                          newCardType === 'physical' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Physical
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Brand</label>
                    <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                      <button
                        onClick={() => setNewCardBrand('visa')}
                        className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors ${
                          newCardBrand === 'visa' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        VISA
                      </button>
                      <button
                        onClick={() => setNewCardBrand('mastercard')}
                        className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors ${
                          newCardBrand === 'mastercard' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        MC
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Card Styling</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewCardColor('violet-glowing')}
                        className={`w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 border-2 ${
                          newCardColor === 'violet-glowing' ? 'border-white' : 'border-transparent'
                        }`}
                        title="Violet Glow"
                      />
                      <button
                        onClick={() => setNewCardColor('pastel-spiral')}
                        className={`w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-200 via-teal-300 to-amber-200 border-2 ${
                          newCardColor === 'pastel-spiral' ? 'border-white' : 'border-transparent'
                        }`}
                        title="Pastel Swirl"
                      />
                      <button
                        onClick={() => setNewCardColor('dark-stripe')}
                        className={`w-6 h-6 rounded-full bg-slate-800 border-2 ${
                          newCardColor === 'dark-stripe' ? 'border-white' : 'border-transparent'
                        }`}
                        title="Dark Gold"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Opening Balance</label>
                    <input
                      type="number"
                      value={newCardBalance}
                      onChange={(e) => setNewCardBalance(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 p-2 text-sm rounded-lg text-white"
                      placeholder="$1,000"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Spending Limit</label>
                    <input
                      type="number"
                      value={newCardLimit}
                      onChange={(e) => setNewCardLimit(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 p-2 text-sm rounded-lg text-white"
                      placeholder="$5,000"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleCreateCard(newCardType, newCardBrand, newCardColor, newCardBalance, newCardLimit)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Create Card
                </button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {selectedCard && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Selected Card Management</h3>
                <VirtualCard
                  card={selectedCard}
                  onFreezeToggle={handleFreezeToggle}
                  onLimitChange={handleLimitChange}
                  isDetailed={true}
                />
              </div>
            )}

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-slate-200">Recent Card Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivity transactions={transactions} enablePagination={true} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const SettingsSectionWrapper = () => (
    <SettingsSection user={user} onUpdateUser={handleUpdateUser} />
  );

  const handleLogout = async () => {
    const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
    if (hasSupabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    setUser(null);
    localStorage.removeItem('fintech_logged_in_user_obj');
    sessionStorage.removeItem('fintech_logged_in_user_obj');
    toast({ title: 'Logged Out', description: 'You have successfully signed out.' });
  };

  if (!user) {
    if (!showAuthForm) {
      return (
        <LandingPage
          onGetStarted={() => {
            setAuthFormTab('signup');
            setShowAuthForm(true);
          }}
          onLogin={() => {
            setAuthFormTab('login');
            setShowAuthForm(true);
          }}
          onRegister={() => {
            setAuthFormTab('signup');
            setShowAuthForm(true);
          }}
        />
      );
    }

    return (
      <LoginPage
        initialTab={authFormTab}
        onBackToLanding={() => setShowAuthForm(false)}
        onLoginSuccess={(userInfo, rememberMe) => {
          setUser(userInfo);
          if (rememberMe) {
            localStorage.setItem('fintech_logged_in_user_obj', JSON.stringify(userInfo));
          } else {
            sessionStorage.setItem('fintech_logged_in_user_obj', JSON.stringify(userInfo));
          }
          toast({ title: 'Welcome back!', description: `Signed in as ${userInfo.name} (${userInfo.role.toUpperCase()})` });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} onLogout={handleLogout} userRole={user.role} />

      <div className="lg:pl-[220px] transition-all duration-300">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onClearAll={handleClearAllNotifications}
          onNavigateSection={setActiveSection}
          activeSection={activeSection}
        />

        <main className="p-6 lg:p-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </main>
      </div>

      {/* Edit Transaction Modal — rendered at root to avoid z-index issues */}
      <EditTransactionModal
        transaction={editingTransaction}
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setEditingTransaction(null);
        }}
        onSubmit={handleUpdateTransaction}
        currentBalance={summary?.balance ?? 0}
      />

      <VaultAIChat
        transactions={transactions}
        summary={summary}
        activeSection={activeSection}
        onNavigateSection={setActiveSection}
      />
    </div>
  );
}

export default App;
