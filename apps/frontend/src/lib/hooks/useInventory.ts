'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export function useInventory(params?: { skip?: number; take?: number; search?: string; filters?: Record<string, any> }) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => api.listInventory(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useInventorySummary() {
  return useQuery({
    queryKey: ['inventorySummary'],
    queryFn: () => api.getInventorySummary(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

export function useExpiringItems(days: number = 30) {
  return useQuery({
    queryKey: ['expiringItems', days],
    queryFn: () => api.getExpiringItems(days),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}
