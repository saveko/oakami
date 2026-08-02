'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DailyTrendData {
  date: string;
  cost: number;
  count?: number;
}

export default function DailyWasteTrendChart({ data }: { data: DailyTrendData[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Waste Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="#0ea5e9"
            strokeWidth={2}
            name="Cost ($)"
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#10b981"
            strokeWidth={2}
            name="Records"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
