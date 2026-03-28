import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { Transaction } from '../../types';
import { subDays, format, isSameDay } from 'date-fns';

interface WeeklyBarChartProps {
  transactions: Transaction[];
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({ transactions }) => {
  const data = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
    
    return last7Days.map(date => {
      const dayTxs = transactions.filter(t => isSameDay(new Date(t.date), date));
      const income = dayTxs.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTxs.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
      
      return {
        name: format(date, 'EEE'), // Mon, Tue, etc.
        Income: income,
        Expense: expense,
      };
    });
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="h-full min-h-[300px] flex flex-col items-center justify-center glass-card">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
          <span className="text-2xl">📈</span>
        </div>
        <h3 className="text-white font-medium mb-1">No Weekly Data</h3>
        <p className="text-white/50 text-sm">Add transactions to see your weekly trend.</p>
      </div>
    );
  }

  return (
    <div className="h-[320px] glass-card p-4 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Last 7 Days Trend</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} dx={-10} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
            />
            <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} iconType="circle" />
            <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
            <Bar dataKey="Expense" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
