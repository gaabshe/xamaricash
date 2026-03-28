import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Transaction, TransactionType } from '../../types';

const schema = yup.object({
  amount: yup.number().positive('Amount must be positive').typeError('Amount must be a number').required('Amount is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  date: yup.string().required('Date is required'),
  type: yup.string().oneOf(['Income', 'Expense']).required()
}).required();

type FormData = yup.InferType<typeof schema>;

const EXPENSE_CATEGORIES = ['Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities', 'Healthcare', 'Education', 'Rent', 'Travel', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other'];

interface TransactionFormProps {
  initialData?: Transaction | null;
  onSubmit: (data: Omit<Transaction, 'id' | 'book_id' | 'user_id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'Expense');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      type: 'Expense',
      date: new Date().toISOString().split('T')[0],
      category: 'Food & Dining',
      amount: undefined
    }
  });

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      reset({
        amount: initialData.amount,
        description: initialData.description,
        category: initialData.category,
        date: initialData.date,
        type: initialData.type
      });
    } else {
      reset({
        type: 'Expense',
        date: new Date().toISOString().split('T')[0],
        category: 'Food & Dining',
      });
    }
  }, [initialData, reset]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setValue('type', newType);
    setValue('category', newType === 'Income' ? 'Salary' : 'Food & Dining');
  };

  const submitHandler = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategories = type === 'Income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      {/* Type Toggle */}
      <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/10">
        <button
          type="button"
          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${type === 'Expense' ? 'bg-pink-500 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          onClick={() => handleTypeChange('Expense')}
        >
          Expense
        </button>
        <button
          type="button"
          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${type === 'Income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          onClick={() => handleTypeChange('Income')}
        >
          Income
        </button>
      </div>

      <Input 
        label="Amount" 
        type="number" 
        step="0.01" 
        placeholder="0.00"
        {...register('amount')}
        error={errors.amount?.message}
      />

      <Input 
        label="Description" 
        placeholder="e.g. Weekly Groceries"
        {...register('description')}
        error={errors.description?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 w-full relative">
          <label className="text-sm font-medium text-white/80 ml-1">Category</label>
          <select 
            className="glass-input w-full bg-slate-800 text-white appearance-none" 
            {...register('category')}
          >
            {currentCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <span className="text-xs text-red-400 ml-1">{errors.category.message}</span>}
        </div>

        <Input 
          label="Date" 
          type="date" 
          {...register('date')}
          error={errors.date?.message}
        />
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? 'Update Transaction' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  );
};
