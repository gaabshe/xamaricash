import React from 'react';
import type { Transaction } from '../../types';
import { TransactionItem } from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
  currency: string;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, currency, onEdit, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center glass-card border border-white/5">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-medium text-white mb-1">No transactions yet</h3>
        <p className="text-white/50 text-sm">Add your first transaction to this book.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map(t => (
        <TransactionItem 
          key={t.id} 
          transaction={t} 
          currency={currency}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
