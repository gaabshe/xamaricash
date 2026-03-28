import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import type { Transaction, Book } from '../types';
import { ExpensePieChart } from '../components/dashboard/ExpensePieChart';
import { WeeklyBarChart } from '../components/dashboard/WeeklyBarChart';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { TrendingUp, TrendingDown, Wallet, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      const [booksRes, txsRes] = await Promise.all([
        supabase.from('books').select('*').eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false })
      ]);
      
      if (booksRes.data) setBooks(booksRes.data);
      if (txsRes.data) setTransactions(txsRes.data);
      
      setIsLoading(false);
    };

    fetchData();

    const booksChannel = supabase.channel('books-dash')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'books', filter: `user_id=eq.${user.id}` }, () => {
        fetchData();
      }).subscribe();
      
    const txsChannel = supabase.channel('txs-dash')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, () => {
        fetchData();
      }).subscribe();

    return () => {
      supabase.removeChannel(booksChannel);
      supabase.removeChannel(txsChannel);
    };
  }, [user]);

  const stats = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'Income') acc.income += Number(t.amount);
      else acc.expense += Number(t.amount);
      acc.balance = acc.income - acc.expense;
      return acc;
    }, { income: 0, expense: 0, balance: 0 });
  }, [transactions]);

  const handleEdit = () => {
    toast('Please edit this transaction inside its specific book.', { icon: 'ℹ️' });
  };

  const handleDelete = () => {
    toast('Please delete this transaction inside its specific book.', { icon: 'ℹ️' });
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
        <p className="text-white/60">Welcome back, {user?.user_metadata?.display_name || 'User'}! Here's your financial summary.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 border-l-4 border-l-purple-500 hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-4 text-white/70">
            <span className="font-medium">Total Balance</span>
            <Wallet size={20} className="text-purple-400"/>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="glass-card p-5 border-l-4 border-l-emerald-500 hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-4 text-white/70">
            <span className="font-medium text-emerald-400">Total Income</span>
            <TrendingUp size={20} className="text-emerald-400"/>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {stats.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-pink-500 hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-4 text-white/70">
            <span className="font-medium text-pink-400">Total Expense</span>
            <TrendingDown size={20} className="text-pink-400"/>
          </div>
          <p className="text-2xl font-bold text-pink-400">
            {stats.expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-blue-500 hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-4 text-white/70">
            <span className="font-medium text-blue-400">Active Books</span>
            <BookOpen size={20} className="text-blue-400"/>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {books.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <WeeklyBarChart transactions={transactions} />
        <ExpensePieChart transactions={transactions} />
      </div>

      <div className="mb-4">
        {isLoading ? (
          <div className="text-white/50 text-center py-8">Loading overview...</div>
        ) : (
          <RecentTransactions 
            transactions={transactions} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
          />
        )}
      </div>
    </AppLayout>
  );
}
