import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.workoutapp.com'; // Replace with your API URL

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken,
              });
              
              const { token } = response.data;
              await AsyncStorage.setItem('authToken', token);
              
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            await AsyncStorage.multiRemove(['authToken', 'refreshToken']);
            // Navigate to login screen
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  public async get<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get(url, { params });
  }

  public async post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post(url, data);
  }

  public async put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put(url, data);
  }

  public async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete(url);
  }

  public async patch<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch(url, data);
  }

  public setAuthToken(token: string) {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  public removeAuthToken() {
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }
}

export const apiClient = new ApiClient();