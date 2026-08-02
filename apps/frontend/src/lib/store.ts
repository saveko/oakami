import { create } from 'zustand';
import { api } from './api';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface DashboardMetrics {
  totalWasteCost: number;
  wasteRecordCount: number;
  expiringItemsAlert: number;
  lowStockAlert: number;
  averageWastePerRecord: number;
  categoryBreakdown: any[];
  dailyTrend: any[];
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

interface DashboardStore {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  error: string | null;
  fetchMetrics: (days?: number) => Promise<void>;
  fetchWasteTrend: (days?: number) => Promise<any>;
  fetchCategoryAnalysis: (days?: number) => Promise<any>;
  fetchTopIngredients: (days?: number) => Promise<any>;
}

// Auth Store
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.login(email, password);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, firstName?: string, lastName?: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.register(email, password, firstName, lastName);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }

    try {
      const user = await api.getProfile();
      set({ user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false });
    }
  },
}));

// Dashboard Store
export const useDashboardStore = create<DashboardStore>((set) => ({
  metrics: null,
  isLoading: false,
  error: null,

  fetchMetrics: async (days = 7) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getDashboardMetrics(days);
      set({ metrics: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch metrics', isLoading: false });
    }
  },

  fetchWasteTrend: async (days = 30) => {
    try {
      return await api.getWasteTrend(days);
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch waste trend' });
      throw error;
    }
  },

  fetchCategoryAnalysis: async (days = 30) => {
    try {
      return await api.getCategoryAnalysis(days);
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch category analysis' });
      throw error;
    }
  },

  fetchTopIngredients: async (days = 30) => {
    try {
      return await api.getTopIngredients(days);
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch top ingredients' });
      throw error;
    }
  },
}));
