import axiosInstance from './index';

export const queryApi = {
  ask: async (question: string, sessionId: number) => {
    const response = await axiosInstance.post('/query/ask', {
      question,
      sessionId,
    });
    return response.data;
  },

  getHistory: async (sessionId: number) => {
    const response = await axiosInstance.get(`/query/history/${sessionId}`);
    return response.data;
  }
};
