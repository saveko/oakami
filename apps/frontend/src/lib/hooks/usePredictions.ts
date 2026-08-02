'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export function usePredictions(days: number = 7) {
  return useQuery({
    queryKey: ['predictions', days],
    queryFn: () => api.getPredictions({ days }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
}

export function useGeneratePredictions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (daysToAnalyze: number = 30) =>
      api.generatePredictions({ daysToAnalyze }),
    onSuccess: () => {
      // Invalidate and refetch predictions after generation
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
    },
  });
}

export function usePredictionsByType(type: string) {
  return useQuery({
    queryKey: ['predictions', type],
    queryFn: () => api.getPredictionsByType(type),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
