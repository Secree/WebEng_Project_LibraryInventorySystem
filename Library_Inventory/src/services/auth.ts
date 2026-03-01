import api from './api';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientRequestError = (error: any) => {
  const message = String(error?.message || '').toLowerCase();
  const code = String(error?.code || '').toLowerCase();

  return (
    code === 'err_network' ||
    code === 'econnaborted' ||
    message.includes('request aborted') ||
    message.includes('network error') ||
    message.includes('timeout')
  );
};

async function withRetry<T>(request: () => Promise<T>, retries = 1) {
  let attemptsLeft = retries;

  while (true) {
    try {
      return await request();
    } catch (error: any) {
      if (!isTransientRequestError(error) || attemptsLeft <= 0) {
        throw error;
      }

      attemptsLeft -= 1;
      await wait(800);
    }
  }
}

export async function login(email: string, password: string) {
  const res = await withRetry(() => api.post('/login', { email, password }));
  return res.data; // { message, user }
}

export async function register(name: string, email: string, password: string, role: string) {
  const res = await api.post('/register', { name, email, password, role });
  return res.data;
}

export async function logout() {
  const res = await api.post('/logout');
  return res.data;
}

export async function fetchResources() {
  const res = await api.get('/resources');
  return res.data;
}

export async function getMe() {
  const res = await withRetry(() => api.get('/me'));
  return res.data; // { message, user }
}
