export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  created_at: string;
  category?: string;
  tags?: string[];
}

export interface WalletSummary {
  balance: number;
  totalCredits: number;
  totalDebits: number;
  totalTransactions: number;
}

export interface CreateTransactionInput {
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  category?: string;
}

export interface TransactionFilters {
  type?: string;
  status?: string;
  currency?: string;
  search?: string;
  category?: string;
}

export interface CardData {
  id: string;
  type: 'virtual' | 'physical';
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  balance: number;
  limit: number;
  isFrozen: boolean;
  colorScheme: 'violet-glowing' | 'pastel-spiral' | 'dark-stripe';
  brand: 'visa' | 'mastercard';
}

export interface NotificationItem {
  id: string;
  type: 'alert' | 'insight' | 'tip' | 'security';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  actionSection?: string;
}

