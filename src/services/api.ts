import axios from 'axios';
import type { Transaction, WalletSummary, CreateTransactionInput, TransactionFilters } from '@/types';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock Data Storage inside localStorage
const STORAGE_KEY = 'fintech_mock_transactions';
const STORAGE_VERSION = 'v3'; // bump this to reset mock data with new defaults
const STORAGE_VERSION_KEY = 'fintech_mock_transactions_version';

const AUTO_CATEGORIES: Record<string, string> = {
  salary: 'Salary',
  tech: 'Salary',
  corp: 'Salary',
  work: 'Salary',
  employer: 'Salary',
  groceries: 'Food & Groceries',
  grocery: 'Food & Groceries',
  foods: 'Food & Groceries',
  supermarket: 'Food & Groceries',
  safeway: 'Food & Groceries',
  netflix: 'Subscription',
  spotify: 'Subscription',
  youtube: 'Subscription',
  hulu: 'Subscription',
  adobe: 'Subscription',
  openai: 'Subscription',
  gym: 'Health & Fitness',
  equinox: 'Health & Fitness',
  fitness: 'Health & Fitness',
  workout: 'Health & Fitness',
  coffee: 'Food & Drinks',
  starbucks: 'Food & Drinks',
  bottle: 'Food & Drinks',
  cafe: 'Food & Drinks',
  restaurant: 'Dining Out',
  diner: 'Dining Out',
  pizza: 'Dining Out',
  burger: 'Dining Out',
  uber: 'Transport',
  lyft: 'Transport',
  taxi: 'Transport',
  cab: 'Transport',
  flight: 'Travel',
  hotel: 'Travel',
  airbnb: 'Travel',
  rent: 'Bills & Utilities',
  electricity: 'Bills & Utilities',
  water: 'Bills & Utilities',
  gas: 'Bills & Utilities',
  freelance: 'Freelance',
  design: 'Freelance',
  consulting: 'Freelance',
  amazon: 'Shopping',
  nike: 'Shopping',
  zara: 'Shopping',
  apple: 'Shopping',
  steam: 'Entertainment',
  cinema: 'Entertainment',
  movie: 'Entertainment',
  gaming: 'Entertainment',
  eats: 'Dining Out',
  delivery: 'Dining Out',
};

export function autoCategorize(description: string): string {
  const desc = description.toLowerCase();
  for (const [key, category] of Object.entries(AUTO_CATEGORIES)) {
    if (desc.includes(key)) {
      return category;
    }
  }
  return 'Other';
}

// Helper to generate a date offset by days from now
const daysAgo = (d: number) => new Date(Date.now() - 1000 * 60 * 60 * 24 * d).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - 1000 * 60 * 60 * h).toISOString();

const DEFAULT_TRANSACTIONS: Transaction[] = [
  // ── 6 months ago ──────────────────────────────────────────────────────────
  { id: 'tx-m6-1', type: 'credit', amount: 5200, currency: 'USD', status: 'completed', description: 'Monthly Salary from Tech Corp', created_at: daysAgo(180), category: 'Salary' },
  { id: 'tx-m6-2', type: 'debit', amount: 1450, currency: 'USD', status: 'completed', description: 'Apartment Monthly Rent Payment', created_at: daysAgo(177), category: 'Bills & Utilities' },
  { id: 'tx-m6-3', type: 'debit', amount: 138, currency: 'USD', status: 'completed', description: 'Whole Foods Market Groceries', created_at: daysAgo(175), category: 'Food & Groceries' },
  { id: 'tx-m6-4', type: 'debit', amount: 15.99, currency: 'USD', status: 'completed', description: 'Netflix Premium Subscription', created_at: daysAgo(174), category: 'Subscription' },
  { id: 'tx-m6-5', type: 'debit', amount: 45, currency: 'USD', status: 'completed', description: 'Equinox Gym Membership', created_at: daysAgo(172), category: 'Health & Fitness' },
  { id: 'tx-m6-6', type: 'debit', amount: 62, currency: 'USD', status: 'completed', description: 'Uber Ride to Airport', created_at: daysAgo(170), category: 'Transport' },
  { id: 'tx-m6-7', type: 'debit', amount: 24.5, currency: 'USD', status: 'completed', description: 'Starbucks Coffee & Pastries', created_at: daysAgo(168), category: 'Food & Drinks' },
  { id: 'tx-m6-8', type: 'debit', amount: 320, currency: 'USD', status: 'completed', description: 'Delta Airlines Flight Ticket', created_at: daysAgo(166), category: 'Travel' },
  { id: 'tx-m6-9', type: 'credit', amount: 800, currency: 'USD', status: 'completed', description: 'Freelance Logo Design Project', created_at: daysAgo(163), category: 'Freelance' },
  { id: 'tx-m6-10', type: 'debit', amount: 78.4, currency: 'USD', status: 'completed', description: 'Cheesecake Factory Dinner', created_at: daysAgo(161), category: 'Dining Out' },
  { id: 'tx-m6-11', type: 'debit', amount: 12, currency: 'USD', status: 'completed', description: 'Spotify Premium Subscription', created_at: daysAgo(160), category: 'Subscription' },
  { id: 'tx-m6-12', type: 'debit', amount: 210, currency: 'USD', status: 'failed', description: 'Unknown Merchant Payment', created_at: daysAgo(158), category: 'Other' },

  // ── 5 months ago ──────────────────────────────────────────────────────────
  { id: 'tx-m5-1', type: 'credit', amount: 5200, currency: 'USD', status: 'completed', description: 'Monthly Salary from Tech Corp', created_at: daysAgo(150), category: 'Salary' },
  { id: 'tx-m5-2', type: 'debit', amount: 1450, currency: 'USD', status: 'completed', description: 'Apartment Monthly Rent Payment', created_at: daysAgo(148), category: 'Bills & Utilities' },
  { id: 'tx-m5-3', type: 'debit', amount: 95.6, currency: 'USD', status: 'completed', description: 'Trader Joe\'s Weekly Groceries', created_at: daysAgo(146), category: 'Food & Groceries' },
  { id: 'tx-m5-4', type: 'debit', amount: 15.99, currency: 'USD', status: 'completed', description: 'Netflix Premium Subscription', created_at: daysAgo(145), category: 'Subscription' },
  { id: 'tx-m5-5', type: 'debit', amount: 45, currency: 'USD', status: 'completed', description: 'Equinox Gym Membership', created_at: daysAgo(143), category: 'Health & Fitness' },
  { id: 'tx-m5-6', type: 'debit', amount: 18.9, currency: 'USD', status: 'completed', description: 'Lyft Pool to Downtown', created_at: daysAgo(141), category: 'Transport' },
  { id: 'tx-m5-7', type: 'debit', amount: 135, currency: 'USD', status: 'completed', description: 'Amazon Electronics Purchase', created_at: daysAgo(139), category: 'Shopping' },
  { id: 'tx-m5-8', type: 'credit', amount: 2200, currency: 'USD', status: 'completed', description: 'Freelance React App Development', created_at: daysAgo(136), category: 'Freelance' },
  { id: 'tx-m5-9', type: 'debit', amount: 44.0, currency: 'USD', status: 'completed', description: 'Sushi Bar Omakase Dinner', created_at: daysAgo(134), category: 'Dining Out' },
  { id: 'tx-m5-10', type: 'debit', amount: 20, currency: 'USD', status: 'completed', description: 'OpenAI ChatGPT Plus', created_at: daysAgo(132), category: 'Subscription' },
  { id: 'tx-m5-11', type: 'debit', amount: 89.5, currency: 'USD', status: 'pending', description: 'Apple App Store Purchase', created_at: daysAgo(130), category: 'Shopping' },
  { id: 'tx-m5-12', type: 'debit', amount: 8.5, currency: 'USD', status: 'completed', description: 'Blue Bottle Coffee Morning', created_at: daysAgo(128), category: 'Food & Drinks' },

  // ── 4 months ago ──────────────────────────────────────────────────────────
  { id: 'tx-m4-1', type: 'credit', amount: 5200, currency: 'USD', status: 'completed', description: 'Monthly Salary from Tech Corp', created_at: daysAgo(120), category: 'Salary' },
  { id: 'tx-m4-2', type: 'debit', amount: 1450, currency: 'USD', status: 'completed', description: 'Apartment Monthly Rent Payment', created_at: daysAgo(118), category: 'Bills & Utilities' },
  { id: 'tx-m4-3', type: 'debit', amount: 112, currency: 'USD', status: 'completed', description: 'Whole Foods Weekly Shop', created_at: daysAgo(116), category: 'Food & Groceries' },
  { id: 'tx-m4-4', type: 'debit', amount: 15.99, currency: 'USD', status: 'completed', description: 'Netflix Premium Subscription', created_at: daysAgo(115), category: 'Subscription' },
  { id: 'tx-m4-5', type: 'debit', amount: 45, currency: 'USD', status: 'completed', description: 'Equinox Gym Membership', created_at: daysAgo(113), category: 'Health & Fitness' },
  { id: 'tx-m4-6', type: 'credit', amount: 1500, currency: 'USD', status: 'completed', description: 'Consulting Gig Payment', created_at: daysAgo(111), category: 'Freelance' },
  { id: 'tx-m4-7', type: 'debit', amount: 560, currency: 'USD', status: 'completed', description: 'Airbnb Weekend Getaway', created_at: daysAgo(109), category: 'Travel' },
  { id: 'tx-m4-8', type: 'debit', amount: 38.6, currency: 'USD', status: 'completed', description: 'Uber Eats Thai Food Delivery', created_at: daysAgo(107), category: 'Dining Out' },
  { id: 'tx-m4-9', type: 'debit', amount: 200, currency: 'USD', status: 'completed', description: 'Electricity & Water Bill', created_at: daysAgo(105), category: 'Bills & Utilities' },
  { id: 'tx-m4-10', type: 'debit', amount: 29.9, currency: 'USD', status: 'completed', description: 'Adobe Creative Cloud Monthly', created_at: daysAgo(103), category: 'Subscription' },
  { id: 'tx-m4-11', type: 'debit', amount: 55, currency: 'USD', status: 'completed', description: 'Nike Running Shoes Online', created_at: daysAgo(101), category: 'Shopping' },
  { id: 'tx-m4-12', type: 'debit', amount: 7.5, currency: 'USD', status: 'completed', description: 'Starbucks Iced Latte', created_at: daysAgo(99), category: 'Food & Drinks' },

  // ── 3 months ago ──────────────────────────────────────────────────────────
  { id: 'tx-m3-1', type: 'credit', amount: 5500, currency: 'USD', status: 'completed', description: 'Monthly Salary from Tech Corp', created_at: daysAgo(90), category: 'Salary' },
  { id: 'tx-m3-2', type: 'debit', amount: 1450, currency: 'USD', status: 'completed', description: 'Apartment Monthly Rent Payment', created_at: daysAgo(88), category: 'Bills & Utilities' },
  { id: 'tx-m3-3', type: 'debit', amount: 142, currency: 'USD', status: 'completed', description: 'Trader Joe\'s & Sprouts Groceries', created_at: daysAgo(86), category: 'Food & Groceries' },
  { id: 'tx-m3-4', type: 'debit', amount: 15.99, currency: 'USD', status: 'completed', description: 'Netflix Premium Subscription', created_at: daysAgo(85), category: 'Subscription' },
  { id: 'tx-m3-5', type: 'debit', amount: 45, currency: 'USD', status: 'completed', description: 'Equinox Gym Membership', created_at: daysAgo(83), category: 'Health & Fitness' },
  { id: 'tx-m3-6', type: 'credit', amount: 3800, currency: 'USD', status: 'completed', description: 'Freelance Mobile App UI Project', created_at: daysAgo(81), category: 'Freelance' },
  { id: 'tx-m3-7', type: 'debit', amount: 72, currency: 'USD', status: 'completed', description: 'Nobu Restaurant Anniversary', created_at: daysAgo(79), category: 'Dining Out' },
  { id: 'tx-m3-8', type: 'debit', amount: 380, currency: 'USD', status: 'completed', description: 'United Airlines Flight Booking', created_at: daysAgo(77), category: 'Travel' },
  { id: 'tx-m3-9', type: 'debit', amount: 165, currency: 'USD', status: 'completed', description: 'Gas & Electricity Bills', created_at: daysAgo(75), category: 'Bills & Utilities' },
  { id: 'tx-m3-10', type: 'debit', amount: 12, currency: 'USD', status: 'completed', description: 'Spotify Family Plan', created_at: daysAgo(73), category: 'Subscription' },
  { id: 'tx-m3-11', type: 'debit', amount: 250, currency: 'USD', status: 'failed', description: 'PayPal Suspicious Charge', created_at: daysAgo(71), category: 'Other' },
  { id: 'tx-m3-12', type: 'debit', amount: 95, currency: 'USD', status: 'completed', description: 'ZARA Clothing Shopping', created_at: daysAgo(69), category: 'Shopping' },
  { id: 'tx-m3-13', type: 'debit', amount: 32, currency: 'USD', status: 'completed', description: 'Lyft Rides This Week', created_at: daysAgo(67), category: 'Transport' },

  // ── 2 months ago ──────────────────────────────────────────────────────────
  { id: 'tx-m2-1', type: 'credit', amount: 5500, currency: 'USD', status: 'completed', description: 'Monthly Salary from Tech Corp', created_at: daysAgo(60), category: 'Salary' },
  { id: 'tx-m2-2', type: 'debit', amount: 1450, currency: 'USD', status: 'completed', description: 'Apartment Monthly Rent Payment', created_at: daysAgo(58), category: 'Bills & Utilities' },
  { id: 'tx-m2-3', type: 'debit', amount: 128, currency: 'USD', status: 'completed', description: 'Whole Foods Weekly Groceries', created_at: daysAgo(56), category: 'Food & Groceries' },
  { id: 'tx-m2-4', type: 'debit', amount: 15.99, currency: 'USD', status: 'completed', description: 'Netflix Premium Subscription', created_at: daysAgo(55), category: 'Subscription' },
  { id: 'tx-m2-5', type: 'debit', amount: 45, currency: 'USD', status: 'completed', description: 'Equinox Gym Membership', created_at: daysAgo(53), category: 'Health & Fitness' },
  { id: 'tx-m2-6', type: 'debit', amount: 48, currency: 'USD', status: 'completed', description: 'Uber Rides Weekly', created_at: daysAgo(51), category: 'Transport' },
  { id: 'tx-m2-7', type: 'credit', amount: 1800, currency: 'USD', status: 'completed', description: 'Freelance SEO Copywriting', created_at: daysAgo(49), category: 'Freelance' },
  { id: 'tx-m2-8', type: 'debit', amount: 62.5, currency: 'USD', status: 'completed', description: 'Shake Shack & Dinner Out', created_at: daysAgo(47), category: 'Dining Out' },
  { id: 'tx-m2-9', type: 'debit', amount: 29.9, currency: 'USD', status: 'completed', description: 'Adobe Creative Cloud', created_at: daysAgo(45), category: 'Subscription' },
  { id: 'tx-m2-10', type: 'debit', amount: 188, currency: 'USD', status: 'completed', description: 'Amazon Holiday Gifts Shopping', created_at: daysAgo(43), category: 'Shopping' },
  { id: 'tx-m2-11', type: 'debit', amount: 175, currency: 'USD', status: 'completed', description: 'Electricity Bill Q4', created_at: daysAgo(41), category: 'Bills & Utilities' },
  { id: 'tx-m2-12', type: 'debit', amount: 11.5, currency: 'USD', status: 'completed', description: 'Local Coffee Roaster', created_at: daysAgo(39), category: 'Food & Drinks' },
  { id: 'tx-m2-13', type: 'debit', amount: 20, currency: 'USD', status: 'pending', description: 'OpenAI ChatGPT Plus Renewal', created_at: daysAgo(37), category: 'Subscription' },

  // ── Last month ────────────────────────────────────────────────────────────
  { id: 'tx-1', type: 'credit', amount: 5500, currency: 'USD', status: 'completed', description: 'Monthly Salary from Tech Corp', created_at: daysAgo(30), category: 'Salary' },
  { id: 'tx-2', type: 'debit', amount: 120.5, currency: 'USD', status: 'completed', description: 'Whole Foods Market Groceries', created_at: daysAgo(28), category: 'Food & Groceries' },
  { id: 'tx-3', type: 'debit', amount: 15.99, currency: 'USD', status: 'completed', description: 'Netflix Premium Subscription', created_at: daysAgo(27), category: 'Subscription' },
  { id: 'tx-4', type: 'credit', amount: 1200, currency: 'USD', status: 'completed', description: 'Freelance UI/UX Design Project', created_at: daysAgo(25), category: 'Freelance' },
  { id: 'tx-5', type: 'debit', amount: 45.0, currency: 'USD', status: 'completed', description: 'Equinox Gym Membership', created_at: daysAgo(24), category: 'Health & Fitness' },
  { id: 'tx-6', type: 'debit', amount: 6.5, currency: 'USD', status: 'completed', description: 'Blue Bottle Coffee Roasters', created_at: daysAgo(22), category: 'Food & Drinks' },
  { id: 'tx-7', type: 'debit', amount: 1450.0, currency: 'USD', status: 'completed', description: 'Apartment Monthly Rent Payment', created_at: daysAgo(20), category: 'Bills & Utilities' },
  { id: 'tx-8', type: 'debit', amount: 85.2, currency: 'USD', status: 'completed', description: 'Uber Ride Airport Transfer', created_at: daysAgo(18), category: 'Transport' },
  { id: 'tx-9', type: 'debit', amount: 22.4, currency: 'USD', status: 'completed', description: 'Starbucks Coffee & Croissant', created_at: daysAgo(15), category: 'Food & Drinks' },
  { id: 'tx-10', type: 'debit', amount: 180.0, currency: 'USD', status: 'completed', description: 'Steam Games Winter Sale', created_at: daysAgo(14), category: 'Entertainment' },
  { id: 'tx-11', type: 'credit', amount: 3400.0, currency: 'USD', status: 'completed', description: 'Freelance Web Development Payment', created_at: daysAgo(10), category: 'Freelance' },
  { id: 'tx-12', type: 'debit', amount: 95.5, currency: 'USD', status: 'completed', description: 'Amazon.com Online Shopping', created_at: daysAgo(8), category: 'Shopping' },
  { id: 'tx-13', type: 'debit', amount: 20.0, currency: 'USD', status: 'completed', description: 'OpenAI ChatGPT Plus Subscription', created_at: daysAgo(5), category: 'Subscription' },
  { id: 'tx-14', type: 'debit', amount: 110.0, currency: 'USD', status: 'completed', description: 'Trader Joe\'s Weekly Groceries', created_at: daysAgo(3), category: 'Food & Groceries' },
  { id: 'tx-15', type: 'debit', amount: 340.0, currency: 'USD', status: 'failed', description: 'Stripe Merchant (Unknown Device)', created_at: daysAgo(2), category: 'Other' },
  { id: 'tx-16', type: 'debit', amount: 54.8, currency: 'USD', status: 'completed', description: 'Olive Garden Italian Dinner', created_at: hoursAgo(12), category: 'Dining Out' },
  { id: 'tx-17', type: 'debit', amount: 12.0, currency: 'USD', status: 'pending', description: 'Spotify Premium Music Family', created_at: hoursAgo(2), category: 'Subscription' },
  { id: 'tx-18', type: 'debit', amount: 4.8, currency: 'USD', status: 'completed', description: 'Blue Bottle Espresso Shot', created_at: new Date().toISOString(), category: 'Food & Drinks' },
];

function getMockTransactions(): Transaction[] {
  const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
  const stored = localStorage.getItem(STORAGE_KEY);
  // If no data exists OR data is from an older version, reset to new defaults
  if (!stored || storedVersion !== STORAGE_VERSION) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TRANSACTIONS));
    localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
    return DEFAULT_TRANSACTIONS;
  }
  return JSON.parse(stored);
}

function setMockTransactions(txs: Transaction[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
}

export async function getWalletSummary(): Promise<WalletSummary> {
  if (api) {
    try {
      const { data } = await api.get('/summary');
      return data;
    } catch (e) {
      console.warn('Failed to fetch from Supabase, using mock fallback', e);
    }
  }

  // Calculate local mock summary
  const txs = getMockTransactions();
  const totalCredits = txs
    .filter((t) => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = txs
    .filter((t) => t.type === 'debit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    balance: totalCredits - totalDebits,
    totalCredits,
    totalDebits,
    totalTransactions: txs.length,
  };
}

export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  if (api) {
    try {
      const params: Record<string, string> = {};
      if (filters?.type) params.type = filters.type;
      if (filters?.status) params.status = filters.status;
      if (filters?.currency) params.currency = filters.currency;
      if (filters?.search) params.search = filters.search;
      const { data } = await api.get('/transactions', { params });
      return data;
    } catch (e) {
      console.warn('Failed to fetch from Supabase, using mock fallback', e);
    }
  }

  let txs = getMockTransactions();
  
  // Sort by created_at descending
  txs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (filters?.type) {
    txs = txs.filter((t) => t.type === filters.type);
  }
  if (filters?.status) {
    txs = txs.filter((t) => t.status === filters.status);
  }
  if (filters?.currency) {
    txs = txs.filter((t) => t.currency.toLowerCase() === filters.currency?.toLowerCase());
  }
  if (filters?.category) {
    txs = txs.filter((t) => t.category?.toLowerCase() === filters.category?.toLowerCase());
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    txs = txs.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.currency.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
    );
  }

  return txs;
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  if (api) {
    try {
      const { data } = await api.post('/transactions', input);
      return data;
    } catch (e) {
      console.warn('Failed to post to Supabase, using mock fallback', e);
    }
  }

  const txs = getMockTransactions();
  const newTx: Transaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...input,
    category: input.category || autoCategorize(input.description),
    created_at: new Date().toISOString(),
  };

  txs.push(newTx);
  setMockTransactions(txs);
  return newTx;
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
  if (api) {
    try {
      const { data } = await api.put(`/transactions/${id}`, updates);
      return data;
    } catch (e) {
      console.warn('Failed to update in Supabase, using mock fallback', e);
    }
  }

  const txs = getMockTransactions();
  const idx = txs.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('Transaction not found');
  
  const updatedTx = { ...txs[idx], ...updates };
  txs[idx] = updatedTx;
  setMockTransactions(txs);
  return updatedTx;
}

