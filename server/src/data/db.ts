import fs from 'fs';
import path from 'path';

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  created_at: string;
  category?: string;
}

const DB_FILE = path.join(__dirname, 'transactions.json');

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'credit',
    amount: 5000,
    currency: 'USD',
    status: 'completed',
    description: 'Monthly Salary from Tech Corp',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    category: 'Salary',
  },
  {
    id: 'tx-2',
    type: 'debit',
    amount: 120.5,
    currency: 'USD',
    status: 'completed',
    description: 'Whole Foods Market Groceries',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    category: 'Food & Groceries',
  },
  {
    id: 'tx-3',
    type: 'debit',
    amount: 15.99,
    currency: 'USD',
    status: 'completed',
    description: 'Netflix Premium Subscription',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 27).toISOString(),
    category: 'Subscription',
  },
  {
    id: 'tx-4',
    type: 'credit',
    amount: 1200,
    currency: 'USD',
    status: 'completed',
    description: 'Freelance UI/UX Design Project',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    category: 'Freelance',
  },
  {
    id: 'tx-5',
    type: 'debit',
    amount: 45.0,
    currency: 'USD',
    status: 'completed',
    description: 'Equinox Gym Membership',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 24).toISOString(),
    category: 'Health & Fitness',
  },
  {
    id: 'tx-6',
    type: 'debit',
    amount: 6.5,
    currency: 'USD',
    status: 'completed',
    description: 'Blue Bottle Coffee Roasters',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
    category: 'Food & Drinks',
  },
  {
    id: 'tx-7',
    type: 'debit',
    amount: 1450.0,
    currency: 'USD',
    status: 'completed',
    description: 'Apartment Monthly Rent Payment',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    category: 'Bills & Utilities',
  },
  {
    id: 'tx-8',
    type: 'debit',
    amount: 85.2,
    currency: 'USD',
    status: 'completed',
    description: 'Uber Ride Airport Transfer',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    category: 'Transport',
  },
  {
    id: 'tx-9',
    type: 'debit',
    amount: 22.4,
    currency: 'USD',
    status: 'completed',
    description: 'Starbucks Coffee & Croissant',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    category: 'Food & Drinks',
  },
  {
    id: 'tx-10',
    type: 'debit',
    amount: 180.0,
    currency: 'USD',
    status: 'completed',
    description: 'Steam Games Winter Sale',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    category: 'Other',
  },
  {
    id: 'tx-11',
    type: 'credit',
    amount: 3400.0,
    currency: 'USD',
    status: 'completed',
    description: 'Freelance Web Development Payment',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    category: 'Freelance',
  },
  {
    id: 'tx-12',
    type: 'debit',
    amount: 95.5,
    currency: 'USD',
    status: 'completed',
    description: 'Amazon.com online shopping',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    category: 'Other',
  },
  {
    id: 'tx-13',
    type: 'debit',
    amount: 20.0,
    currency: 'USD',
    status: 'completed',
    description: 'OpenAI ChatGPT Subscription',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    category: 'Subscription',
  },
  {
    id: 'tx-14',
    type: 'debit',
    amount: 110.0,
    currency: 'USD',
    status: 'completed',
    description: 'Trader Joe\'s Weekly Groceries',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    category: 'Food & Groceries',
  },
  {
    id: 'tx-15',
    type: 'debit',
    amount: 340.0,
    currency: 'USD',
    status: 'failed',
    description: 'Stripe Merchant (Unknown Device)',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    category: 'Other',
  },
  {
    id: 'tx-16',
    type: 'debit',
    amount: 54.8,
    currency: 'USD',
    status: 'completed',
    description: 'Olive Garden Italian Diner',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    category: 'Dining Out',
  },
  {
    id: 'tx-17',
    type: 'debit',
    amount: 12.0,
    currency: 'USD',
    status: 'pending',
    description: 'Spotify Premium Music Family',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    category: 'Subscription',
  },
  {
    id: 'tx-18',
    type: 'debit',
    amount: 4.8,
    currency: 'USD',
    status: 'completed',
    description: 'Blue Bottle Espresso Shot',
    created_at: new Date().toISOString(),
    category: 'Food & Drinks',
  },
];

export function getTransactionsFromDB(): Transaction[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      // Ensure data directory exists
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_TRANSACTIONS, null, 2), 'utf-8');
      return DEFAULT_TRANSACTIONS;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading from database file:', err);
    return DEFAULT_TRANSACTIONS;
  }
}

export function saveTransactionsToDB(transactions: Transaction[]): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(transactions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to database file:', err);
  }
}
