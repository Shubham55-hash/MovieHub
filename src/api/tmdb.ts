import axios from 'axios';
import { TMDB_BASE_URL, TMDB_API_KEY } from '../constants/api';

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  params: {
    api_key: TMDB_API_KEY,
    language: 'en-US',
  },
});

// Request interceptor: log in dev
tmdbApi.interceptors.request.use((config) => {
  if (__DEV__) {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

// Response interceptor: normalize errors
tmdbApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.status_message || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export default tmdbApi;
