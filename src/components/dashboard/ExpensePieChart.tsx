import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Transaction } from '../../types';

interface ExpensePieChartProps {
  transactions: Transaction[];
}

const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#f43f5e'];

export const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ transactions }) => {
  const data = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'Expense');
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="h-full min-h-[300px] flex flex-col items-center justify-center glass-card">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="text-white font-medium mb-1">No Expense Data</h3>
        <p className="text-white/50 text-sm">Add expenses to see your pie chart.</p>
      </div>
    );
  }

  return (
    <div className="h-[320px] glass-card p-4 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-2">Expenses by Category</h3>
      <div className="flex-1 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => `$${Number(value).toFixed(2)}`}
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ color: '#fff', fontWeight: 500 }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', color: '#cbd5e1' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
