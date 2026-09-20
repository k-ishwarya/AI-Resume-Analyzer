import api from './api';

export const authService = {
  async register(name, email, password, confirmPassword) {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      confirm_password: confirmPassword,
    });
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
