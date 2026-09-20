import api from './api';

export const adminService = {
  async getStatistics() {
    const response = await api.get('/admin/statistics');
    return response.data;
  },

  async getUsers() {
    const response = await api.get('/admin/users');
    return response.data;
  },

  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  async getResumes() {
    const response = await api.get('/admin/resumes');
    return response.data;
  },

  async deleteResume(resumeId) {
    const response = await api.delete(`/admin/resumes/${resumeId}`);
    return response.data;
  },
};
