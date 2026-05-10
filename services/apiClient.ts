import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.1.119:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add the Authorization header
apiClient.interceptors.request.use(
  async (config: any) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from SecureStore', error);
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Optional: Intercept responses to handle global errors like 401 Unauthorized
apiClient.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response && error.response.status === 401) {
      // You could trigger a global logout here if the token is completely invalid
      console.warn('Unauthorized! Token expired or invalid.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
