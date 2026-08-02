'use client';

import { Suspense, lazy } from 'react';
import { useDashboardMetrics, usePredictions, useGeneratePredictions } from '@/lib/hooks';
import { useUnreadCount } from '@/lib/hooks/useNotifications';
import PredictionCard from '@/components/PredictionCard';

// Lazy load recharts to avoid loading 300KB+ on initial page load
const DailyWasteTrendChart = lazy(() => import('./DailyWasteTrendChart'));
const CategoryBreakdownChart = lazy(() => import('./CategoryBreakdownChart'));

const ChartSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
    <div className="h-80 bg-gray-100 rounded animate-pulse" />
  </div>
);

const MetricCard = ({ label, value, unit = '' }: { label: string; value: number | string; unit?: string }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <p className="text-gray-600 text-sm font-medium">{label}</p>
    <p className="text-3xl font-bold text-gray-900 mt-2">
      {typeof value === 'number' ? value.toLocaleString() : value}
      {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
    </p>
  </div>
);

export default function DashboardPage() {
  const { data: metricsData, isLoading, error } = useDashboardMetrics(7);
  const { data: predictionsData } = usePredictions(7);
  const { mutate: generatePredictions, isPending: genPending } = useGeneratePredictions();
  const { data: unreadData } = useUnreadCount();

  const metrics = metricsData;
  const predictions = predictionsData || [];
  const unreadCount = unreadData?.unreadCount || 0;

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
          Error loading dashboard
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
      {unreadCount > 0 && (
        <div className="mb-8 p-4 bg-sky-50 border border-sky-200 rounded-lg">
          <p className="text-sky-900 font-medium">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Last 7 days overview</p>
      </div>

      {/* AI Predictions Section */}
      {predictions.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">AI Predictions</h2>
            <button
              onClick={() => generatePredictions(30)}
              disabled={genPending}
              className="px-4 py-1 text-sm bg-sky-100 text-sky-700 rounded hover:bg-sky-200 transition disabled:opacity-50"
            >
              {genPending ? 'Generating...' : 'Refresh'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {predictions.map((pred: any) => (
              <PredictionCard key={pred.id} prediction={pred} />
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard label="Total Waste Cost" value={Math.round(metrics.totalWasteCost)} unit="$" />
        <MetricCard label="Waste Records" value={metrics.wasteRecordCount} />
        <MetricCard label="Expiring Items" value={metrics.expiringItemsAlert} />
        <MetricCard label="Low Stock Items" value={metrics.lowStockAlert} />
      </div>

      {/* Charts - Lazy loaded with Suspense */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Suspense fallback={<ChartSkeleton />}>
          <DailyWasteTrendChart data={metrics.dailyTrend} />
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <CategoryBreakdownChart data={metrics.categoryBreakdown} />
        </Suspense>
      </div>

      {/* Additional Stats */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600 text-sm">Average Waste per Record</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {metrics.averageWastePerRecord?.toFixed(2) || '0'} kg
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
              {metrics.categoryBreakdown?.length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
