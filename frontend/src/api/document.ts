import axiosInstance from './index';

export const documentApi = {
  upload: async (file: File, sessionId: number) => {
    const formData = new FormData();
    formData.append('file', file);

    return axiosInstance.post(`/documents/upload?sessionId=${sessionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getAll: async (sessionId: number) => {
    const response = await axiosInstance.get(`/documents/${sessionId}`);
    return response.data;
  },

  remove: async (id: number) => {
    return axiosInstance.delete(`/documents/${id}`);
  }
};
