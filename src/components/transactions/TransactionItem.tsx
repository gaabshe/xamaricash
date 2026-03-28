import React from 'react';
import type { Transaction } from '../../types';
import { format } from 'date-fns';
import { 
  ArrowUpRight, 
  Briefcase, Coffee, ShoppingBag, 
  Car, Home, Zap, Heart, 
  GraduationCap, Plane, HelpCircle, 
  Edit2, Trash2
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Salary': <Briefcase size={20} />,
  'Freelance': <Briefcase size={20} />,
  'Investment': <ArrowUpRight size={20} />,
  'Food & Dining': <Coffee size={20} />,
  'Shopping': <ShoppingBag size={20} />,
  'Transport': <Car size={20} />,
  'Rent': <Home size={20} />,
  'Bills & Utilities': <Zap size={20} />,
  'Healthcare': <Heart size={20} />,
  'Education': <GraduationCap size={20} />,
  'Travel': <Plane size={20} />,
  'Other': <HelpCircle size={20} />
};

interface TransactionItemProps {
  transaction: Transaction;
  currency: string;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, currency, onEdit, onDelete }) => {
  const isIncome = transaction.type === 'Income';
  const Icon = CATEGORY_ICONS[transaction.category] || <HelpCircle size={20} />;

  return (
    <div className="glass-card mb-3 p-4 flex items-center gap-4 hover:bg-white/10 transition-colors group">
      <div className={`p-3 rounded-xl flex-shrink-0 ${isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-pink-500/20 text-pink-400'}`}>
        {Icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate">{transaction.description}</h4>
        <div className="flex items-center gap-2 text-xs text-white/50 mt-1">
          <span className="bg-white/10 px-2 py-0.5 rounded-md text-white/70">{transaction.category}</span>
          <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
        </div>
      </div>
      
      <div className="text-right flex flex-col items-end gap-1">
        <span className={`font-bold whitespace-nowrap ${isIncome ? 'text-emerald-400' : 'text-pink-400'}`}>
          {isIncome ? '+' : '-'}{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
        </span>
        
        <div className="flex flex-row items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity mt-1">
          <button onClick={() => onEdit(transaction)} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(transaction.id)} className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
