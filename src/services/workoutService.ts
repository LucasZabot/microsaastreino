import { apiClient } from './api';
import { Workout, WorkoutHistory, ApiResponse, WorkoutCategory, DifficultyLevel } from '../types';

class WorkoutService {
  async getWorkouts(category?: WorkoutCategory, difficulty?: DifficultyLevel): Promise<ApiResponse<Workout[]>> {
    const params: any = {};
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;
    
    const response = await apiClient.get<ApiResponse<Workout[]>>('/workouts', params);
    return response.data;
  }

  async getWorkoutById(id: string): Promise<ApiResponse<Workout>> {
    const response = await apiClient.get<ApiResponse<Workout>>(`/workouts/${id}`);
    return response.data;
  }

  async searchWorkouts(query: string): Promise<ApiResponse<Workout[]>> {
    const response = await apiClient.get<ApiResponse<Workout[]>>('/workouts/search', {
      q: query,
    });
    return response.data;
  }

  async getFavoriteWorkouts(): Promise<ApiResponse<Workout[]>> {
    const response = await apiClient.get<ApiResponse<Workout[]>>('/workouts/favorites');
    return response.data;
  }

  async addToFavorites(workoutId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/workouts/${workoutId}/favorite`);
    return response.data;
  }

  async removeFromFavorites(workoutId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/workouts/${workoutId}/favorite`);
    return response.data;
  }

  async getWorkoutHistory(): Promise<ApiResponse<WorkoutHistory[]>> {
    const response = await apiClient.get<ApiResponse<WorkoutHistory[]>>('/workouts/history');
    return response.data;
  }

  async completeWorkout(workoutHistory: Omit<WorkoutHistory, 'id'>): Promise<ApiResponse<WorkoutHistory>> {
    const response = await apiClient.post<ApiResponse<WorkoutHistory>>('/workouts/complete', workoutHistory);
    return response.data;
  }

  async getWorkoutsByCategory(category: WorkoutCategory): Promise<ApiResponse<Workout[]>> {
    const response = await apiClient.get<ApiResponse<Workout[]>>(`/workouts/category/${category}`);
    return response.data;
  }

  async getWorkoutsByDifficulty(difficulty: DifficultyLevel): Promise<ApiResponse<Workout[]>> {
    const response = await apiClient.get<ApiResponse<Workout[]>>(`/workouts/difficulty/${difficulty}`);
    return response.data;
  }

  async getRecommendedWorkouts(): Promise<ApiResponse<Workout[]>> {
    const response = await apiClient.get<ApiResponse<Workout[]>>('/workouts/recommended');
    return response.data;
  }

  async getPopularWorkouts(): Promise<ApiResponse<Workout[]>> {
    const response = await apiClient.get<ApiResponse<Workout[]>>('/workouts/popular');
    return response.data;
  }

  async getRecentWorkouts(): Promise<ApiResponse<Workout[]>> {
    const response = await apiClient.get<ApiResponse<Workout[]>>('/workouts/recent');
    return response.data;
  }

  async rateWorkout(workoutId: string, rating: number): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/workouts/${workoutId}/rate`, {
      rating,
    });
    return response.data;
  }

  async getWorkoutStats(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>('/workouts/stats');
    return response.data;
  }
}

export const workoutService = new WorkoutService();