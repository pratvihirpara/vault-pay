import { Request, Response } from 'express';
import { getTransactionsFromDB, saveTransactionsToDB, Transaction } from '../data/db';

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
};

function autoCategorize(description: string): string {
  const desc = description.toLowerCase();
  for (const [key, category] of Object.entries(AUTO_CATEGORIES)) {
    if (desc.includes(key)) {
      return category;
    }
  }
  return 'Other';
}

// GET /api/summary
export function getSummary(req: Request, res: Response) {
  try {
    const transactions = getTransactionsFromDB();

    const totalCredits = transactions
      .filter((t) => t.type === 'credit' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalDebits = transactions
      .filter((t) => t.type === 'debit' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalCredits - totalDebits;
    const totalTransactions = transactions.length;

    res.json({
      balance,
      totalCredits,
      totalDebits,
      totalTransactions,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

// GET /api/transactions
export function getTransactions(req: Request, res: Response) {
  try {
    let transactions = getTransactionsFromDB();

    // Sort by created_at descending
    transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const { type, status, currency, search, category } = req.query;

    if (type) {
      transactions = transactions.filter((t) => t.type === type);
    }
    if (status) {
      transactions = transactions.filter((t) => t.status === status);
    }
    if (currency) {
      transactions = transactions.filter((t) => t.currency.toLowerCase() === (currency as string).toLowerCase());
    }
    if (category) {
      transactions = transactions.filter((t) => t.category?.toLowerCase() === (category as string).toLowerCase());
    }
    if (search) {
      const q = (search as string).toLowerCase();
      transactions = transactions.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q) ||
          t.currency.toLowerCase().includes(q) ||
          (t.category && t.category.toLowerCase().includes(q))
      );
    }

    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

// POST /api/transactions
export function createTransaction(req: Request, res: Response) {
  try {
    const transactions = getTransactionsFromDB();
    const { type, amount, currency, status, description, category } = req.body;

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      amount: Number(amount),
      currency,
      status: status || 'completed',
      description,
      category: category || autoCategorize(description),
      created_at: new Date().toISOString(),
    };

    transactions.push(newTx);
    saveTransactionsToDB(transactions);

    res.status(201).json(newTx);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

// PUT /api/transactions/:id
export function updateTransaction(req: Request, res: Response) {
  try {
    const transactions = getTransactionsFromDB();
    const { id } = req.params;

    const idx = transactions.findIndex((t) => t.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const updatedTx = { ...transactions[idx], ...req.body };
    transactions[idx] = updatedTx;
    saveTransactionsToDB(transactions);

    res.json(updatedTx);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
