import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const credentials = sessionStorage.getItem('agosmanuel_basic_auth');
  if (credentials) {
    config.headers.Authorization = `Basic ${credentials}`;
  }
  return config;
});

export function setCredentials(username, password) {
  sessionStorage.setItem('agosmanuel_basic_auth', btoa(`${username}:${password}`));
}

export function clearCredentials() {
  sessionStorage.removeItem('agosmanuel_basic_auth');
}

export function hasCredentials() {
  return Boolean(sessionStorage.getItem('agosmanuel_basic_auth'));
}

export default api;
