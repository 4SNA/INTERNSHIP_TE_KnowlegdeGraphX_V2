import axiosInstance from './index';

export const documentApi = {
  upload: async (file: File, sessionId: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId.toString());

    return axiosInstance.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getAll: async (sessionId: number) => {
    const response = await axiosInstance.get(`/documents/${sessionId}`);
    return response.data;
  }
};
