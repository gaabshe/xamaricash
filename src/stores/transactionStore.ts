import { create } from 'zustand';
import type { Transaction } from '../types';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: false,
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) => set((state) => ({ 
    transactions: [transaction, ...state.transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })),
  updateTransaction: (id, data) => set((state) => {
    const newTxs = state.transactions.map(t => t.id === id ? { ...t, ...data } : t);
    return { transactions: newTxs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) };
  }),
  deleteTransaction: (id) => set((state) => ({
    transactions: state.transactions.filter(t => t.id !== id)
  })),
  setLoading: (isLoading) => set({ isLoading }),
}));
