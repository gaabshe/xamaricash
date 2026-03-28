import React from 'react';
import type { Transaction } from '../../types';
import { TransactionItem } from '../transactions/TransactionItem';
import { Link } from 'react-router-dom';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, onEdit, onDelete }) => {
  const recent = transactions.slice(0, 5);

  return (
    <div className="glass-card p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
        <Link to="/books" className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors">
          View Books →
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <p className="text-white/50">No recent transactions across your books</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recent.map(t => (
            <TransactionItem 
              key={t.id} 
              transaction={t} 
              currency={""} 
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
