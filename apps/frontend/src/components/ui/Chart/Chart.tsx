'use client';

import React, { useState } from 'react';
import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  Bar,
  Pie,
  Area,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

export interface ChartSeries {
  key: string;
  label: string;
  color?: string;
}

export interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  series: ChartSeries[];
  xAxis?: {
    key: string;
    label?: string;
  };
  yAxis?: {
    label?: string;
    domain?: [number, number];
  };
  legend?: boolean;
  tooltip?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  height?: number;
  className?: string;
  ariaLabel?: string;
}

const defaultColors = [
  '#0EA5E9', // sky-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
];

export const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  (
    {
      type,
      data,
      series,
      xAxis,
      yAxis,
      legend = true,
      tooltip = true,
      isLoading = false,
      emptyMessage = 'No data available',
      height = 400,
      className,
      ariaLabel,
    },
    ref
  ) => {
    const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);

    if (isLoading) {
      return (
        <div
          ref={ref}
          className={cn(
            'rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800',
            className
          )}
          style={{ height: `${height}px` }}
          role="img"
          aria-busy="true"
          aria-label={ariaLabel || `Loading ${type} chart`}
        >
          <div className={cn('bg-gray-100 dark:bg-gray-700 animate-pulse rounded', 'w-full h-full')}></div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800',
            className
          )}
          style={{ height: `${height}px` }}
          role="status"
          aria-label={ariaLabel || 'Chart empty state'}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      );
    }

    const visibleSeries = series.filter((s) => !hiddenSeries.includes(s.key));

    const handleLegendClick = (e: any) => {
      const key = e.dataKey;
      setHiddenSeries((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    };

    const tooltipProps = tooltip
      ? {
        contentStyle: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: 'none',
          borderRadius: '4px',
          color: '#fff',
        },
      }
      : undefined;

    const legendProps = legend
      ? {
        wrapperStyle: {
          paddingTop: '20px',
          fontSize: '12px',
        },
      }
      : { wrapperStyle: { display: 'none' } };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 overflow-hidden',
          className
        )}
        role="img"
        aria-label={ariaLabel || `${type} chart showing ${series.map((s) => s.label).join(', ')}`}
        style={{ height: `${height}px` }}
      >
        {type === 'line' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.3)" />
              {xAxis && <XAxis dataKey={xAxis.key} label={xAxis.label} />}
              <YAxis {...(yAxis || {})} />
              {tooltip && <Tooltip {...tooltipProps} />}
              {legend && <Legend {...legendProps} onClick={handleLegendClick} />}
              {visibleSeries.map((s, idx) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color || defaultColors[idx % defaultColors.length]}
                  name={s.label}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {type === 'bar' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.3)" />
              {xAxis && <XAxis dataKey={xAxis.key} label={xAxis.label} />}
              <YAxis {...(yAxis || {})} />
              {tooltip && <Tooltip {...tooltipProps} />}
              {legend && <Legend {...legendProps} onClick={handleLegendClick} />}
              {visibleSeries.map((s, idx) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  fill={s.color || defaultColors[idx % defaultColors.length]}
                  name={s.label}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}

        {type === 'pie' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey={series[0]?.key || 'value'}
                nameKey={xAxis?.key || 'name'}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.map((_, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={
                      series[0]?.color ||
                      defaultColors[idx % defaultColors.length]
                    }
                  />
                ))}
              </Pie>
              {tooltip && <Tooltip {...tooltipProps} />}
              {legend && <Legend {...legendProps} />}
            </PieChart>
          </ResponsiveContainer>
        )}

        {type === 'area' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.3)" />
              {xAxis && <XAxis dataKey={xAxis.key} label={xAxis.label} />}
              <YAxis {...(yAxis || {})} />
              {tooltip && <Tooltip {...tooltipProps} />}
              {legend && <Legend {...legendProps} onClick={handleLegendClick} />}
              {visibleSeries.map((s, idx) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color || defaultColors[idx % defaultColors.length]}
                  fill={s.color || defaultColors[idx % defaultColors.length]}
                  name={s.label}
                  opacity={0.6}
                  isAnimationActive={true}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  }
);

Chart.displayName = 'Chart';
