import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(data) {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },

  async changePassword(data) {
    const res = await api.post('/auth/change-password', data);
    return res.data;
  },

  async forgotPassword(email) {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(data) {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },

  async deleteAccount() {
    const res = await api.delete('/auth/delete-account');
    return res.data;
  },

  async seedDemo() {
    const res = await api.post('/demo/seed');
    return res.data;
  }
};
