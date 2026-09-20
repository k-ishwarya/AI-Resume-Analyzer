import api from './api';

export const jobService = {
  async matchJob(resumeId, jobTitle, company, jobDescription) {
    const response = await api.post(`/job-match/${resumeId}`, {
      resume_id: resumeId,
      job_title: jobTitle,
      company: company || null,
      job_description: jobDescription,
    });
    return response.data;
  },

  async getJobMatch(jobAnalysisId) {
    const response = await api.get(`/job-match/${jobAnalysisId}`);
    return response.data;
  },

  async getResumeJobMatches(resumeId) {
    const response = await api.get(`/job-match/resume/${resumeId}`);
    return response.data;
  },
};
