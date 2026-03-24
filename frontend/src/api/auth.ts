import axiosInstance from './index';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  provider?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (data: { fullName: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/api/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getMe: async (): Promise<AuthUser> => {
    const response = await axiosInstance.get('/api/auth/me');
    return response.data;
  },

  validateToken: async (): Promise<boolean> => {
    try {
      await axiosInstance.post('/api/auth/validate');
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: (): AuthUser | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getGoogleLoginUrl: () => {
    return 'http://localhost:8080/oauth2/authorization/google';
  },

  getGitHubLoginUrl: () => {
    return 'http://localhost:8080/oauth2/authorization/github';
  },

  updateProfile: async (data: { fullName?: string; avatarUrl?: string }): Promise<AuthUser> => {
    const response = await axiosInstance.put('/api/auth/profile', data);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },
};
