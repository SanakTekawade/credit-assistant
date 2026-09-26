import api from './api';
export { authService } from './authService';

export const profileService = {
  async getFinancialProfile() {
    const res = await api.get('/profile/financial');
    return res.data;
  },

  async completeOnboarding(data) {
    const res = await api.post('/profile/financial', data);
    return res.data;
  },

  async updateFinancialProfile(data) {
    const res = await api.put('/profile/financial', data);
    return res.data;
  },

  async getDti() {
    const res = await api.get('/profile/dti');
    return res.data;
  },

  async getUtilization() {
    const res = await api.get('/profile/utilization');
    return res.data;
  },

  async getImprovementDelta() {
    const res = await api.get('/profile/improvement-delta');
    return res.data;
  },

  async getDashboardData() {
    const res = await api.get('/dashboard');
    return res.data;
  },

  async getRoadmap() {
    const res = await api.get('/dashboard/roadmap');
    return res.data;
  }
};

export const creditService = {
  async getSummary() {
    const res = await api.get('/credit/summary');
    return res.data;
  },

  async getHistory(timeframe = 'all') {
    const res = await api.get(`/credit/history?timeframe=${timeframe}`);
    return res.data;
  },

  async updateScore(score, note) {
    const res = await api.post('/credit/score', { credit_score: score, note });
    return res.data;
  }
};

export const debtService = {
  async getDebts() {
    const res = await api.get('/debts');
    return res.data;
  },

  async createDebt(debtData) {
    const res = await api.post('/debts', debtData);
    return res.data;
  },

  async updateDebt(id, debtData) {
    const res = await api.put(`/debts/${id}`, debtData);
    return res.data;
  },

  async deleteDebt(id) {
    const res = await api.delete(`/debts/${id}`);
    return res.data;
  }
};

export const aiService = {
  async runAnalysis(forceRefresh = false) {
    const res = await api.post('/ai/analyze', { force_refresh: forceRefresh });
    return res.data;
  },

  async getHistory() {
    const res = await api.get('/ai/history');
    return res.data;
  }
};

export const notificationService = {
  async getNotifications() {
    const res = await api.get('/notifications');
    return res.data;
  },

  async markAsRead(id) {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllRead() {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },

  async deleteNotification(id) {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  }
};
