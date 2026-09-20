import api from './api';

export const resumeService = {
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getResumes() {
    const response = await api.get('/resumes');
    return response.data;
  },

  async getResume(id) {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  },

  async deleteResume(id) {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  },
};
