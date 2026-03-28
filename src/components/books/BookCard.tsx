import React from 'react';
import type { Book } from '../../types';
import { Card } from '../ui/Card';
import { BookOpen, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onEdit, onDelete }) => {
  return (
    <Card className="hover:scale-[1.02] transition-transform p-0 overflow-hidden flex flex-col h-full cursor-pointer relative group border-white/20">
      <Link to={`/books/${book.id}`} className="flex-1 p-6 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-white/10">
            <BookOpen className="text-purple-300" size={24} />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{book.name}</h3>
        <p className="text-white/50 text-sm flex-1 mb-4 line-clamp-2">{book.description || 'No description provided'}</p>
        
        <div className="flex items-center gap-2 text-white/80 font-medium">
          <DollarSign size={16} className="text-emerald-400" />
          <span>{book.currency} Base Currency</span>
        </div>
      </Link>
      
      {/* Absolute positioned actions on hover (Desktop) & slightly visible on mobile */}
      <div className="absolute top-4 right-4 flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(book); }}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-md transition-colors text-xs font-semibold backdrop-blur"
        >
          Edit
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(book.id); }}
          className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-200 backdrop-blur-md transition-colors text-xs font-semibold"
        >
          Delete
        </button>
      </div>
    </Card>
  );
};
