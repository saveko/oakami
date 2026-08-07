'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export function useFilterWasteRecords(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['filteredWaste', filters],
    queryFn: () => api.filterWasteRecords(filters || {}),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!filters,
  });
}

export function useFilterPresets() {
  return useQuery({
    queryKey: ['filterPresets'],
    queryFn: () => api.getFilterPresets(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSaveFilterPreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string; filterCriteria: Record<string, any> }) =>
      api.saveFilterPreset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filterPresets'] });
    },
  });
}

export function useDeleteFilterPreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (presetId: string) => api.deleteFilterPreset(presetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filterPresets'] });
    },
  });
}

export function useExportWasteRecords() {
  return useMutation({
    mutationFn: (filters: Record<string, any>) => api.exportWasteRecords(filters),
  });
}
