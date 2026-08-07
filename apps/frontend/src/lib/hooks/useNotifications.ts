'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { api } from '../api';

export function useUnreadCount() {
  // Store for managing polling state
  const pollIntervalRef = useRef(30000); // Start at 30 seconds
  const intervalIdRef = useRef<NodeJS.Timeout>();

  const query = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => api.getUnreadCount(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    refetchInterval: () => {
      // Only poll if tab is visible
      if (typeof document !== 'undefined' && document.hidden) {
        return false; // Disable polling when hidden
      }
      return pollIntervalRef.current;
    },
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - stop polling
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
        }
      } else {
        // Tab is visible - resume polling with reset interval
        pollIntervalRef.current = 30000;
        query.refetch();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [query]);

  return query;
}

export function useNotifications(limit: number = 20) {
  return useQuery({
    queryKey: ['notifications', limit],
    queryFn: () => api.getNotifications({ limit }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.markAsRead(id),
    onSuccess: () => {
      // Invalidate notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.markAllAsRead(),
    onSuccess: () => {
      // Invalidate notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });
}
