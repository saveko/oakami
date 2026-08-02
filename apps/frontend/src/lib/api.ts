import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token refresh on 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.client.post('/auth/refresh', {});
              const { accessToken } = response.data;
              localStorage.setItem('accessToken', accessToken);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/auth/login';
          }
        }

        return Promise.reject(error);
      },
    );
  }

  // Authentication
  async register(email: string, password: string, firstName?: string, lastName?: string) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async getProfile() {
    const response = await this.client.post('/auth/me', {});
    return response.data;
  }

  // Waste
  async createWasteRecord(data: any) {
    const response = await this.client.post('/waste', data);
    return response.data;
  }

  async listWasteRecords(params?: any) {
    const response = await this.client.get('/waste', { params });
    return response.data;
  }

  async getWasteDashboardStats(days: number = 7) {
    const response = await this.client.get('/waste/dashboard/stats', { params: { days } });
    return response.data;
  }

  async approveWasteRecord(id: string) {
    const response = await this.client.patch(`/waste/${id}/approve`, {});
    return response.data;
  }

  // Analytics
  async getDashboardMetrics(days: number = 7) {
    const response = await this.client.get('/analytics/dashboard', { params: { days } });
    return response.data;
  }

  async getWasteTrend(days: number = 30) {
    const response = await this.client.get('/analytics/waste-trend', { params: { days } });
    return response.data;
  }

  async getCategoryAnalysis(days: number = 30) {
    const response = await this.client.get('/analytics/categories', { params: { days } });
    return response.data;
  }

  async getTopIngredients(days: number = 30, limit: number = 15) {
    const response = await this.client.get('/analytics/top-ingredients', { params: { days, limit } });
    return response.data;
  }

  async getSupplierAnalysis(days: number = 30) {
    const response = await this.client.get('/analytics/suppliers', { params: { days } });
    return response.data;
  }

  async getCostAnalysis(days: number = 30) {
    const response = await this.client.get('/analytics/cost-analysis', { params: { days } });
    return response.data;
  }

  async getHeatmapData(metric: string = 'cost') {
    const response = await this.client.get('/analytics/heatmap', { params: { metric } });
    return response.data;
  }

  // Inventory
  async listInventory(params?: any) {
    const response = await this.client.get('/inventory', { params });
    return response.data;
  }

  async getInventorySummary() {
    const response = await this.client.get('/inventory/summary');
    return response.data;
  }

  async getExpiringItems(days: number = 30) {
    const response = await this.client.get('/inventory/expiring', { params: { days } });
    return response.data;
  }

  // Ingredients
  async listIngredients(params?: any) {
    const response = await this.client.get('/ingredients', { params });
    return response.data;
  }

  async listCategories() {
    const response = await this.client.get('/ingredients/categories');
    return response.data;
  }

  // Reports
  async listReports(params?: any) {
    const response = await this.client.get('/reports', { params });
    return response.data;
  }

  async getDailyReport(date?: string) {
    const response = await this.client.get('/reports/daily/today', { params: { date } });
    return response.data;
  }

  async getWeeklyReport() {
    const response = await this.client.get('/reports/weekly/current');
    return response.data;
  }

  async getMonthlyReport(month?: number, year?: number) {
    const response = await this.client.get('/reports/monthly/current', { params: { month, year } });
    return response.data;
  }

  // Suppliers
  async listSuppliers(params?: any) {
    const response = await this.client.get('/suppliers', { params });
    return response.data;
  }

  async getSupplierPerformance(id: string, days: number = 30) {
    const response = await this.client.get(`/suppliers/${id}/performance`, { params: { days } });
    return response.data;
  }

  async getSupplierComparison(days: number = 30) {
    const response = await this.client.get('/suppliers/comparison/all', { params: { days } });
    return response.data;
  }

  // Organizations
  async createOrganization(data: any) {
    const response = await this.client.post('/organizations', data);
    return response.data;
  }

  async getOrganization(id: string) {
    const response = await this.client.get(`/organizations/${id}`);
    return response.data;
  }

  async getOrganizationSettings(id: string) {
    const response = await this.client.get(`/organizations/${id}/settings`);
    return response.data;
  }

  async updateOrganizationSettings(id: string, data: any) {
    const response = await this.client.patch(`/organizations/${id}/settings`, data);
    return response.data;
  }

  // Health
  async checkHealth() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const api = new ApiClient();
