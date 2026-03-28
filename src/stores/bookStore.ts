import { create } from 'zustand';
import type { Book } from '../types';

interface BookState {
  books: Book[];
  activeBookId: string | null;
  isLoading: boolean;
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  updateBook: (id: string, data: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  setActiveBookId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useBookStore = create<BookState>((set) => ({
  books: [],
  activeBookId: null,
  isLoading: false,
  setBooks: (books) => set({ books }),
  addBook: (book) => set((state) => ({ books: [...state.books, book] })),
  updateBook: (id, data) => set((state) => ({
    books: state.books.map(b => b.id === id ? { ...b, ...data } : b)
  })),
  deleteBook: (id) => set((state) => ({
    books: state.books.filter(b => b.id !== id),
    activeBookId: state.activeBookId === id ? null : state.activeBookId
  })),
  setActiveBookId: (id) => set({ activeBookId: id }),
  setLoading: (isLoading) => set({ isLoading }),
}));
