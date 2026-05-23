import { Request, Response, NextFunction } from 'express';
import { getTransactionsFromDB } from '../data/db';

export function validateTransaction(req: Request, res: Response, next: NextFunction) {
  const { type, amount, currency, description } = req.body;

  // Basic field checks
  if (!type || !['credit', 'debit'].includes(type)) {
    return res.status(400).json({ error: "Type must be 'credit' or 'debit'" });
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number greater than 0" });
  }

  if (!currency || typeof currency !== 'string' || currency.trim() === '') {
    return res.status(400).json({ error: "Currency is required" });
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    return res.status(400).json({ error: "Description is required" });
  }

  // Insufficient balance check for debits
  if (type === 'debit') {
    const transactions = getTransactionsFromDB();
    
    // Calculate current balance based on completed transactions
    const totalCredits = transactions
      .filter((t) => t.type === 'credit' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalDebits = transactions
      .filter((t) => t.type === 'debit' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const currentBalance = totalCredits - totalDebits;

    if (numericAmount > currentBalance) {
      return res.status(422).json({ error: "Insufficient balance for this debit transaction" });
    }
  }

  // Sanitize values
  req.body.amount = numericAmount;
  req.body.currency = currency.trim();
  req.body.description = description.trim();

  next();
}
