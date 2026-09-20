import api from './api';

export const chatService = {
  async sendMessage(message, resumeId = null) {
    const response = await api.post('/chat', {
      message,
      resume_id: resumeId,
    });
    return response.data;
  },

  async getChatHistory(resumeId) {
    const response = await api.get(`/chat/history/${resumeId}`);
    return response.data;
  },

  async clearChatHistory(resumeId) {
    const response = await api.delete(`/chat/history/${resumeId}`);
    return response.data;
  },
};
