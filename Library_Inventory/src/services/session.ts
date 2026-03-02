const AUTH_TOKEN_KEY = 'auth_token';

export function getAuthToken() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  console.log('getAuthToken called, found token:', !!token);
  return token;
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  console.log('setAuthToken called, token saved:', !!token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
