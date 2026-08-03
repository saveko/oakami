'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export function useWasteRecords(params?: { skip?: number; take?: number }) {
  return useQuery({
    queryKey: ['wasteRecords', params],
    queryFn: () => api.listWasteRecords(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateWasteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      ingredientId: string;
      category: string;
      quantity: number;
      unit: string;
      cost: number;
    }) => api.createWasteRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wasteRecords'] });
    },
  });
}

export function useApproveWasteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordId: string) => api.approveWasteRecord(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wasteRecords'] });
    },
  });
}

export function useRejectWasteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordId: string) => api.rejectWasteRecord(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wasteRecords'] });
    },
  });
}

export function useWasteDashboardStats(days: number = 7) {
  return useQuery({
    queryKey: ['wasteDashboardStats', days],
    queryFn: () => api.getWasteDashboardStats(days),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
}
