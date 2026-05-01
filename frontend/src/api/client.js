import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,  // always send the httpOnly cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// pull error message out of the standard { success, data, message } envelope
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong. Try again?';
    return Promise.reject(new Error(message));
  }
);

export default api;
