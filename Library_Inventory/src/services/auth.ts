import api from './api';

export async function login(email: string, password: string) {
  const res = await api.post('/login', { email, password });
  return res.data; // { message, user }
}

export async function register(name: string, email: string, password: string, role: string) {
  const res = await api.post('/register', { name, email, password, role });
  return res.data;
}

export async function fetchResources() {
  const res = await api.get('/resources');
  return res.data;
}

export async function getMe() {
  const res = await api.get('/me');
  return res.data; // { message, user }
}
