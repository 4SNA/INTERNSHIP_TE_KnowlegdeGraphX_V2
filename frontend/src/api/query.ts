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
  },

  generateDocument: async (
    prompt: string,
    sessionId: number,
    type: 'REPORT' | 'SUMMARY' | 'NOTES' | 'COMPARISON' | 'CODE' | 'CUSTOM' = 'CUSTOM'
  ) => {
    const response = await axiosInstance.post('/generate/document', {
      prompt,
      sessionId,
      type,
    });
    return response.data;
  },
};
