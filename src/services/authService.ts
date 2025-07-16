import { apiClient } from './api';
import { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    
    if (response.data.data.token) {
      await AsyncStorage.setItem('authToken', response.data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    
    if (response.data.data.token) {
      await AsyncStorage.setItem('authToken', response.data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Handle logout error
    } finally {
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
      apiClient.removeAuthToken();
    }
  }

  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', {
      refreshToken,
    });
    
    if (response.data.data.token) {
      await AsyncStorage.setItem('authToken', response.data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', {
      email,
    });
    
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
      token,
      newPassword,
    });
    
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    
    return response.data;
  }

  async updateProfile(userData: any): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.put<ApiResponse<AuthResponse>>('/auth/profile', userData);
    
    if (response.data.data.user) {
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/verify-email', {
      token,
    });
    
    return response.data;
  }

  async resendVerificationEmail(): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/resend-verification');
    
    return response.data;
  }

  async checkAuthStatus(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return false;
      
      const response = await apiClient.get('/auth/me');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();