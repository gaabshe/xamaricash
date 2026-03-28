import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTransactionStore } from '../stores/transactionStore';
import { AppLayout } from '../components/layout/AppLayout';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Transaction, Book } from '../types';
import toast from 'react-hot-toast';

export default function BookView() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { transactions, setTransactions } = useTransactionStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!user || !bookId) return;

    const fetchBook = async () => {
      const { data } = await supabase.from('books').select('*').eq('id', bookId).single();
      if (data) setBook(data);
      else {
        toast.error('Book not found');
        navigate('/books');
      }
    };
    
    const fetchTransactions = async () => {
      const { data } = await supabase.from('transactions').select('*').eq('book_id', bookId).order('date', { ascending: false });
      if (data) setTransactions(data);
      setIsLoading(false);
    };

    fetchBook();
    fetchTransactions();

    const bookChannel = supabase.channel('book-view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'books', filter: `id=eq.${bookId}` }, () => fetchBook())
      .subscribe();
      
    const txChannel = supabase.channel('txs-view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `book_id=eq.${bookId}` }, () => fetchTransactions())
      .subscribe();

    return () => {
      supabase.removeChannel(bookChannel);
      supabase.removeChannel(txChannel);
    };
  }, [user, bookId, navigate, setTransactions]);

  const stats = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'Income') acc.income += Number(t.amount);
      else acc.expense += Number(t.amount);
      acc.balance = acc.income - acc.expense;
      return acc;
    }, { income: 0, expense: 0, balance: 0 });
  }, [transactions]);

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
        toast.success('Transaction deleted');
      } catch (error: any) {
        toast.error(error.message || 'Error deleting transaction');
      }
    }
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTx(null);
  };

  const handleSubmitTransaction = async (data: Omit<Transaction, 'id' | 'book_id' | 'user_id' | 'created_at'>) => {
    if (!user || !bookId) return;
    try {
      if (editingTx) {
        const { error } = await supabase.from('transactions').update(data).eq('id', editingTx.id);
        if (error) throw error;
        toast.success('Transaction updated');
      } else {
        const { error } = await supabase.from('transactions').insert([{
          ...data,
          book_id: bookId,
          user_id: user.id
        }]);
        if (error) throw error;
        toast.success('Transaction added');
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || 'Error saving transaction');
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/books')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={20} /> Back to Books
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white break-words">{book?.name || 'Loading...'}</h1>
            {book?.description && <p className="text-white/60 mt-1">{book.description}</p>}
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="shrink-0 w-full md:w-auto">
            <Plus size={20} /> Add Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5 border-t border-t-purple-500/50">
          <div className="flex items-center gap-3 mb-2 text-white/70">
            <Wallet size={18} className="text-purple-400"/>
            <span className="font-medium">Net Balance</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.balance < 0 ? '-' : ''}{book?.currency || '$'}{Math.abs(stats.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="glass-card p-5 border-t border-t-emerald-500/50">
          <div className="flex items-center gap-3 mb-2 text-white/70">
            <TrendingUp size={18} className="text-emerald-400"/>
            <span className="font-medium">Total Income</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {book?.currency || '$'}{stats.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="glass-card p-5 border-t border-t-pink-500/50">
          <div className="flex items-center gap-3 mb-2 text-white/70">
            <TrendingDown size={18} className="text-pink-400"/>
            <span className="font-medium">Total Expense</span>
          </div>
          <p className="text-2xl font-bold text-pink-400">
            {book?.currency || '$'}{stats.expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="bg-slate-900/40 rounded-3xl p-4 md:p-6 border border-white/5">
        <h2 className="text-xl font-semibold text-white mb-6">Transaction History</h2>
        {isLoading ? (
          <div className="text-center text-white/50 py-12">Loading transactions...</div>
        ) : (
          <TransactionList 
            transactions={transactions} 
            currency={book?.currency || 'USD'} 
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingTx ? 'Edit Transaction' : 'New Transaction'}
      >
        <TransactionForm 
          initialData={editingTx || undefined}
          onSubmit={handleSubmitTransaction}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Mobile Fab */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg shadow-purple-500/40 flex items-center justify-center text-white focus:outline-none z-40"
      >
        <Plus size={24} />
      </button>
    </AppLayout>
  );
}
