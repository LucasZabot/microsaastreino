import { apiClient } from './api';
import { SubscriptionPlan, PaymentMethod, ApiResponse } from '../types';

class PaymentService {
  async getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    const response = await apiClient.get<ApiResponse<SubscriptionPlan[]>>('/payments/plans');
    return response.data;
  }

  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    const response = await apiClient.get<ApiResponse<PaymentMethod[]>>('/payments/methods');
    return response.data;
  }

  async addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>): Promise<ApiResponse<PaymentMethod>> {
    const response = await apiClient.post<ApiResponse<PaymentMethod>>('/payments/methods', paymentMethod);
    return response.data;
  }

  async removePaymentMethod(paymentMethodId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/payments/methods/${paymentMethodId}`);
    return response.data;
  }

  async subscribeToPlan(planId: string, paymentMethodId: string): Promise<ApiResponse<{ message: string, subscriptionId: string }>> {
    const response = await apiClient.post<ApiResponse<{ message: string, subscriptionId: string }>>('/payments/subscribe', {
      planId,
      paymentMethodId,
    });
    return response.data;
  }

  async cancelSubscription(): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/payments/cancel-subscription');
    return response.data;
  }

  async getCurrentSubscription(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>('/payments/current-subscription');
    return response.data;
  }

  async getInvoices(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<ApiResponse<any[]>>('/payments/invoices');
    return response.data;
  }

  async processPayment(paymentData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>('/payments/process', paymentData);
    return response.data;
  }

  async validatePayment(paymentId: string): Promise<ApiResponse<{ isValid: boolean }>> {
    const response = await apiClient.get<ApiResponse<{ isValid: boolean }>>(`/payments/validate/${paymentId}`);
    return response.data;
  }

  async getPaymentHistory(): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<ApiResponse<any[]>>('/payments/history');
    return response.data;
  }

  async refundPayment(paymentId: string, reason: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/payments/refund/${paymentId}`, {
      reason,
    });
    return response.data;
  }

  async updateSubscription(planId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.put<ApiResponse<{ message: string }>>('/payments/subscription', {
      planId,
    });
    return response.data;
  }

  async getPaymentStats(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>('/payments/stats');
    return response.data;
  }
}

export const paymentService = new PaymentService();