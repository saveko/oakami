'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

/**
 * Cache configuration for analytics queries
 * - Dashboard metrics: 5 minutes (frequently accessed)
 * - Detailed analysis: 5 minutes (category, ingredients, suppliers)
 * - Heatmap: 10 minutes (less frequently updated)
 * - AI predictions: 30 minutes (generated daily)
 * - Static data: 30-60 minutes (categories, ingredients)
 */
const CACHE_CONFIG = {
  dashboard: { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 },
  analysis: { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 },
  heatmap: { staleTime: 10 * 60 * 1000, gcTime: 20 * 60 * 1000 },
  predictions: { staleTime: 30 * 60 * 1000, gcTime: 60 * 60 * 1000 },
  static: { staleTime: 30 * 60 * 1000, gcTime: 60 * 60 * 1000 },
};

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

export function useDashboardMetrics(days: number = 7) {
  return useQuery({
    queryKey: ['dashboardMetrics', days],
    queryFn: () => api.getDashboardMetrics(days),
    ...CACHE_CONFIG.dashboard,
    retry: 1,
  });
}

export function useCategoryBreakdown(days: number = 30) {
  return useQuery({
    queryKey: ['categoryBreakdown', days],
    queryFn: () => api.getCategoryAnalysis(days),
    ...CACHE_CONFIG.analysis,
    retry: 1,
  });
}

export function useWasteTrend(days: number = 30) {
  return useQuery({
    queryKey: ['wasteTrend', days],
    queryFn: () => api.getWasteTrend(days),
    ...CACHE_CONFIG.analysis,
    retry: 1,
  });
}

export function useTopIngredients(days: number = 30, limit: number = 15) {
  return useQuery({
    queryKey: ['topIngredients', days, limit],
    queryFn: () => api.getTopIngredients(days, limit),
    ...CACHE_CONFIG.analysis,
    retry: 1,
  });
}

export function useSupplierWasteAnalysis(days: number = 30) {
  return useQuery({
    queryKey: ['supplierAnalysis', days],
    queryFn: () => api.getSupplierAnalysis(days),
    ...CACHE_CONFIG.analysis,
    retry: 1,
  });
}

export function useCostAnalysis(days: number = 30) {
  return useQuery({
    queryKey: ['costAnalysis', days],
    queryFn: () => api.getCostAnalysis(days),
    ...CACHE_CONFIG.analysis,
    retry: 1,
  });
}

export function useHeatmapData(metric: string = 'cost') {
  return useQuery({
    queryKey: ['heatmapData', metric],
    queryFn: () => api.getHeatmapData(metric),
    ...CACHE_CONFIG.heatmap,
    retry: 1,
  });
}

// ============================================================================
// WASTE HOOKS
// ============================================================================

export function useWasteDashboardStats(days: number = 7) {
  return useQuery({
    queryKey: ['wasteDashboardStats', days],
    queryFn: () => api.getWasteDashboardStats(days),
    ...CACHE_CONFIG.dashboard,
    retry: 1,
  });
}

export function useWasteRecordsList(params?: any) {
  return useQuery({
    queryKey: ['wasteRecordsList', params],
    queryFn: () => api.listWasteRecords(params),
    ...CACHE_CONFIG.analysis,
    retry: 1,
    enabled: true,
  });
}

// ============================================================================
// INVENTORY HOOKS
// ============================================================================

export function useInventoryList(params?: any) {
  return useQuery({
    queryKey: ['inventoryList', params],
    queryFn: () => api.listInventory(params),
    ...CACHE_CONFIG.analysis,
    retry: 1,
    enabled: true,
  });
}

export function useInventorySummary() {
  return useQuery({
    queryKey: ['inventorySummary'],
    queryFn: () => api.getInventorySummary(),
    ...CACHE_CONFIG.dashboard,
    retry: 1,
  });
}

export function useExpiringItems(days: number = 30) {
  return useQuery({
    queryKey: ['expiringItems', days],
    queryFn: () => api.getExpiringItems(days),
    ...CACHE_CONFIG.analysis,
    retry: 1,
  });
}

// ============================================================================
// INGREDIENT & CATEGORY HOOKS
// ============================================================================

export function useIngredientsList(params?: any) {
  return useQuery({
    queryKey: ['ingredientsList', params],
    queryFn: () => api.listIngredients(params),
    ...CACHE_CONFIG.static,
    retry: 1,
  });
}

export function useIngredientCategories() {
  return useQuery({
    queryKey: ['ingredientCategories'],
    queryFn: () => api.listCategories(),
    ...CACHE_CONFIG.static,
    retry: 1,
  });
}

// ============================================================================
// REPORTS HOOKS
// ============================================================================

export function useReportsList(params?: any) {
  return useQuery({
    queryKey: ['reportsList', params],
    queryFn: () => api.listReports(params),
    ...CACHE_CONFIG.analysis,
    retry: 1,
  });
}

export function useDailyReport(date?: string) {
  return useQuery({
    queryKey: ['dailyReport', date],
    queryFn: () => api.getDailyReport(date),
    ...CACHE_CONFIG.analysis,
    retry: 1,
  });
}

export function useWeeklyReport() {
  return useQuery({
    queryKey: ['weeklyReport'],
    queryFn: () => api.getWeeklyReport(),
    ...CACHE_CONFIG.analysis,
    retry: 1,
  });
}

export function useMonthlyReport(month?: number, year?: number) {
  return useQuery({
    queryKey: ['monthlyReport', month, year],
    queryFn: () => api.getMonthlyReport(month, year),
    ...CACHE_CONFIG.analysis,
    retry: 1,
  });
}

// ============================================================================
// SUPPLIERS HOOKS
// ============================================================================

export function useSuppliersList(params?: any) {
  return useQuery({
    queryKey: ['suppliersList', params],
    queryFn: () => api.listSuppliers(params),
    ...CACHE_CONFIG.analysis,
    retry: 1,
  });
}

export function useSupplierPerformance(id: string, days: number = 30) {
  return useQuery({
    queryKey: ['supplierPerformance', id, days],
    queryFn: () => api.getSupplierPerformance(id, days),
    ...CACHE_CONFIG.analysis,
    retry: 1,
    enabled: !!id,
  });
}

export function useSupplierComparison(days: number = 30) {
  return useQuery({
    queryKey: ['supplierComparison', days],
    queryFn: () => api.getSupplierComparison(days),
    ...CACHE_CONFIG.analysis,
    retry: 1,
  });
}
