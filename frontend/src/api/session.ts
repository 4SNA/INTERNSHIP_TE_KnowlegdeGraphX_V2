import axiosInstance from './index';

export const sessionApi = {
  create: async () => {
    const response = await axiosInstance.post('/session/create');
    return response.data;
  },

  join: async (sessionCode: string) => {
    const response = await axiosInstance.post('/session/join', { sessionCode });
    return response.data;
  },

  getUsers: async (sessionId: number) => {
    const response = await axiosInstance.get(`/session/${sessionId}/users`);
    return response.data;
  }
};
