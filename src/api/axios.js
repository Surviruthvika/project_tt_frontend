import axios from 'axios';

const api = axios.create({
  baseURL: 'https://au-backend-1-1jf0.onrender.com/api',
  timeout: 10000, // ⏱️ 10 seconds
});

// 🔐 REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {

    // 🔴 Network error (backend down / CORS)
    if (!error.response) {
      alert('Server not reachable. Please try again later.');
      return Promise.reject(error);
    }

    // 🔴 Unauthorized
    if (error.response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }

    // 🔴 Other errors
    return Promise.reject(error);
  }
);

export default api;