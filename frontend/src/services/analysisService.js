import api from './api';

export const analysisService = {
  async analyzeResume(resumeId) {
    const response = await api.post(`/analysis/${resumeId}`);
    return response.data;
  },

  async getLatestAnalysis(resumeId) {
    const response = await api.get(`/analysis/${resumeId}`);
    return response.data;
  },

  async getAnalysisById(analysisId) {
    const response = await api.get(`/analysis/detail/${analysisId}`);
    return response.data;
  },

  async deleteAnalysis(analysisId) {
    const response = await api.delete(`/analysis/${analysisId}`);
    return response.data;
  },

  async improveProject(projectName, technologies, currentDescription) {
    const response = await api.post('/analysis/improve-project', {
      project_name: projectName,
      technologies,
      current_description: currentDescription,
    });
    return response.data;
  },
};
