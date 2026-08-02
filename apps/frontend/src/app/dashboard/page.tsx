'use client';

import { useEffect } from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useDashboardStore } from '@/lib/store';

const COLORS = ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function DashboardPage() {
  const { metrics, isLoading, error, fetchMetrics } = useDashboardStore();

  useEffect(() => {
    fetchMetrics(7);
  }, []);

  const MetricCard = ({ label, value, unit = '' }: { label: string; value: number | string; unit?: string }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600 text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          No metrics data available
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Last 7 days overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="Total Waste Cost"
          value={Math.round(metrics.totalWasteCost)}
          unit="$"
        />
        <MetricCard
          label="Waste Records"
          value={metrics.wasteRecordCount}
        />
        <MetricCard
          label="Expiring Items"
          value={metrics.expiringItemsAlert}
        />
        <MetricCard
          label="Low Stock Items"
          value={metrics.lowStockAlert}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Waste Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Waste Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.dailyTrend}>
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
                dataKey="quantity"
                stroke="#10b981"
                strokeWidth={2}
                name="Quantity (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Waste by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {metrics.categoryBreakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600 text-sm">Average Waste per Record</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {metrics.averageWastePerRecord.toFixed(2)} kg
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Daily Average Cost</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              ${(metrics.totalWasteCost / 7).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Categories Tracked</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {metrics.categoryBreakdown.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
