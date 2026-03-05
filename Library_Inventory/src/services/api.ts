import axios from 'axios';
import { clearAuthToken, getAuthToken } from './session';
import type { Resource } from '../components/inventory/types';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Allow cookies to be sent with requests
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  console.log('API Request:', { url: config.url, hasToken: !!token, tokenPreview: token ? `${token.substring(0, 20)}...` : 'none' });

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No token found in localStorage for authenticated request');
  }

  return config;
});

// Response interceptor to log errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = String(error.response?.data?.error || error.response?.data?.message || error.message || '').toLowerCase();

    if (
      status === 401 &&
      (
        message.includes('token expired') ||
        message.includes('invalid token') ||
        message.includes('no token provided') ||
        message.includes('authentication failed')
      )
    ) {
      clearAuthToken();
      localStorage.removeItem('user');

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:expired'));
      }
    }

    console.error('API Error:', {
      url: error.config?.url,
      status,
      message: error.response?.data?.error || error.response?.data?.message || error.message,
      headers: error.config?.headers
    });
    return Promise.reject(error);
  }
);

export interface ReservationRecord {
  id: string;
  userId: string;
  resourceId: string;
  userEmail: string;
  resourceTitle: string;
  status: string;
  reservationDate: string;
  dueDate: string;
  returnDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserReservation {
  id: string;
  resourceTitle: string;
  userEmail: string;
  status: string;
  reservationDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationResponse {
  message: string;
  reservation: ReservationRecord;
  resource: Resource;
}

export interface CancelReservationResponse {
  message: string;
  reservation: ReservationRecord;
  resource: Resource | null;
}

// Resource API functions
export const getAllResources = async () => {
  const response = await api.get('/resources');
  return response.data;
};

export const getResourceById = async (id: string) => {
  const response = await api.get(`/resources/${id}`);
  return response.data;
};

export const createResource = async (resourceData: any) => {
  const response = await api.post('/resources', resourceData);
  return response.data;
};

export const updateResource = async (id: string, resourceData: any) => {
  const response = await api.put(`/resources/${id}`, resourceData);
  return response.data;
};

export const deleteResource = async (id: string) => {
  const response = await api.delete(`/resources/${id}`);
  return response.data;
};

export const reserveResource = async (resourceId: string, reservationDate: string, notes?: string) => {
  const response = await api.post('/reservations', {
    resourceId,
    reservationDate,
    notes,
  });
  return response.data as ReservationResponse;
};

export const getMyReservations = async () => {
  const response = await api.get('/reservations/mine');
  return response.data as UserReservation[];
};

export const cancelReservation = async (reservationId: string) => {
  const response = await api.patch(`/reservations/${reservationId}/cancel`);
  return response.data as CancelReservationResponse;
};

// Admin API functions
export const getAllUsers = async (userId: string) => {
  const response = await api.post('/admin/users', { userId });
  return response.data;
};

export const deleteUser = async (userId: string, targetUserId: string) => {
  const response = await api.post('/admin/delete-user', { userId, targetUserId });
  return response.data;
};

export default api;
