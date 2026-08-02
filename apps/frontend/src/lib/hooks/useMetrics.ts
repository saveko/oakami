'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export function useDashboardMetrics(days: number = 7) {
  return useQuery({
    queryKey: ['dashboardMetrics', days],
    queryFn: () => api.getDashboardMetrics(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
}

export function useCategoryBreakdown(days: number = 7) {
  return useQuery({
    queryKey: ['categoryBreakdown', days],
    queryFn: () => api.getCategoryAnalysis(days),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useWasteTrend(days: number = 30) {
  return useQuery({
    queryKey: ['wasteTrend', days],
    queryFn: () => api.getWasteTrendAnalysis(days),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useTopIngredients(days: number = 30, limit: number = 10) {
  return useQuery({
    queryKey: ['topIngredients', days, limit],
    queryFn: () => api.getTopWastedIngredients(days, limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
