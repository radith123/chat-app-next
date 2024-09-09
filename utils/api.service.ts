import env from '@/constants/env.constant';
import axios from 'axios';
import Router from 'next/router';

const apiService = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiService.interceptors.request.use(
  (config) => {
    console.log(localStorage);
    const userData = localStorage.getItem('user-data');
    if (userData) {
      const { access_token } = JSON.parse(userData);
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
)

apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user-data');
      Router.push('/login');
    }
    return Promise.reject(error)
  }
);

export default apiService;
