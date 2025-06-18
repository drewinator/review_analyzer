import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', credentials);
    return response.data.data;
  },

  me: async () => {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },
};


export const reviewAPI = {
  getReviews: async (restaurantId?: string, filters?: any) => {
    const params = new URLSearchParams();
    if (restaurantId) params.append('restaurantId', restaurantId);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    
    const response = await api.get(`/reviews?${params.toString()}`);
    return response.data.data;
  },

  getReviewById: async (reviewId: string) => {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data.data;
  },

  updateReviewStatus: async (reviewId: string, status: string) => {
    const response = await api.patch(`/reviews/${reviewId}`, { status });
    return response.data.data;
  },

  getAnalytics: async (restaurantId?: string) => {
    const params = restaurantId ? `?restaurantId=${restaurantId}` : '';
    const response = await api.get(`/reviews/analytics${params}`);
    return response.data.data;
  },
};

export const restaurantAPI = {
  getRestaurants: async () => {
    const response = await api.get('/restaurants');
    return response.data.data;
  },

  createRestaurant: async (restaurantData: any) => {
    const response = await api.post('/restaurants', restaurantData);
    return response.data.data;
  },

  searchGooglePlaces: async (query: string, location?: string) => {
    const params = new URLSearchParams({ query });
    if (location) params.append('location', location);
    
    const response = await api.get(`/restaurants/search-places?${params.toString()}`);
    return response.data.data;
  },

  importReviews: async (restaurantId: string) => {
    const response = await api.post(`/restaurants/${restaurantId}/import-reviews`);
    return response.data.data;
  },

  addManualReview: async (reviewData: any) => {
    const response = await api.post('/restaurants/manual-review', reviewData);
    return response.data.data;
  },
};

export const googleAPI = {
  getAuthUrl: async () => {
    const response = await api.get('/google/auth-url');
    return response.data.data;
  },

  getBusinessLocations: async () => {
    const response = await api.get('/google/locations');
    return response.data.data;
  },

  getLocationReviews: async (locationName: string) => {
    const response = await api.get(`/google/locations/${encodeURIComponent(locationName)}/reviews`);
    return response.data.data;
  },
};

export default api;