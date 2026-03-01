import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Allow cookies to be sent with requests
});

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
