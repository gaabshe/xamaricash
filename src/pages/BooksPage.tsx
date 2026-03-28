import React, { useState, useEffect } from 'react';
import { useBookStore } from '../stores/bookStore';
import { useAuthStore } from '../stores/authStore';
import { AppLayout } from '../components/layout/AppLayout';
import { BookCard } from '../components/books/BookCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Book } from '../types';
import toast from 'react-hot-toast';

export default function BooksPage() {
  const { user } = useAuthStore();
  const { books, setBooks, setLoading, isLoading } = useBookStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', currency: 'USD' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const fetchBooks = async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(error);
        toast.error('Failed to load books');
      } else if (data) {
        setBooks(data);
      }
      setLoading(false);
    };

    fetchBooks();

    const channel = supabase.channel('books-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'books', filter: `user_id=eq.${user.id}` }, () => {
        fetchBooks();
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [user, setBooks, setLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.name) return toast.error('Name is required');
    
    setIsSubmitting(true);
    try {
      if (editingBook) {
        const { error } = await supabase.from('books').update({ ...formData }).eq('id', editingBook.id);
        if (error) throw error;
        toast.success('Book updated');
      } else {
        const { error } = await supabase.from('books').insert([{
          ...formData,
          user_id: user.id
        }]);
        if (error) throw error;
        toast.success('Book created');
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || 'Error saving book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this book? All transactions inside will be orphaned or need manual deletion.')) {
      try {
        const { error } = await supabase.from('books').delete().eq('id', id);
        if (error) throw error;
        toast.success('Book deleted');
      } catch (error: any) {
        toast.error(error.message || 'Error deleting book');
      }
    }
  };

  const handleEdit = (book: Book) => {
    setFormData({ name: book.name, description: book.description || '', currency: book.currency });
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
    setFormData({ name: '', description: '', currency: 'USD' });
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Books</h1>
          <p className="text-white/60 mt-1">Manage your separate accounting ledgers</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="hidden sm:flex">
          <Plus size={20} /> New Book
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center text-white/50 py-12">Loading setup...</div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center glass-card">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
            <Plus className="text-purple-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No books yet</h3>
          <p className="text-white/60 mb-6 max-w-sm">Create your first cashbook to start tracking your income and expenses.</p>
          <Button onClick={() => setIsModalOpen(true)}>Create Your First Book</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {books.map(book => (
            <BookCard key={book.id} book={book} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Mobile Fab */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg shadow-purple-500/40 flex items-center justify-center text-white focus:outline-none z-40"
      >
        <Plus size={24} />
      </button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingBook ? 'Edit Book' : 'Create New Book'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Book Name" 
            placeholder="e.g. Business 2024" 
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input 
            label="Description (Optional)" 
            placeholder="Main company expenses" 
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-white/80 ml-1">Currency</label>
            <select 
              className="glass-input w-full bg-slate-800 text-white" 
              value={formData.currency}
              onChange={e => setFormData({ ...formData, currency: e.target.value })}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>{editingBook ? 'Save Changes' : 'Create Book'}</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
