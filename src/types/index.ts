export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  default_currency: string;
  theme: string;
}

export interface Book {
  id: string;
  user_id: string;
  name: string;
  description: string;
  currency: string;
  color_theme?: string;
  created_at: string;
}

export type TransactionType = 'Income' | 'Expense';

export interface Transaction {
  id: string;
  book_id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  description: string;
  created_at: string;
}
