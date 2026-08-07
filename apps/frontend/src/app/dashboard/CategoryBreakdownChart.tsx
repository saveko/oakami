'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#0ea5e9',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

interface CategoryData {
  categoryId: string;
  categoryName: string;
  cost: number;
  quantity?: number;
  count?: number;
}

export default function CategoryBreakdownChart({ data }: { data: CategoryData[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Waste by Category</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ categoryName, cost }) => {
              const total = data.reduce((sum, d) => sum + d.cost, 0);
              const percent = total > 0 ? ((cost / total) * 100).toFixed(0) : 0;
              return `${categoryName} ${percent}%`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="cost"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => `$${(typeof value === 'number' ? value : parseFloat(value as string)).toFixed(2)}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
