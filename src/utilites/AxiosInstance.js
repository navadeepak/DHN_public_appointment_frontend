import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3007',
  timeout: 10000,
  withCredentials: true, // **Key Fix**: Sends session cookies to backend
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor (add cookie log for debug)
instance.interceptors.request.use((config) => {
  console.log('Frontend Request to:', config.url, 'withCredentials:', config.withCredentials);
  return config;
}, (error) => Promise.reject(error));

// Response interceptor (unchanged)
instance.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default instance;