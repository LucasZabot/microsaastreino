import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WorkoutState, Workout, WorkoutHistory } from '../../types';
import { workoutService } from '../../services/workoutService';

const initialState: WorkoutState = {
  workouts: [],
  currentWorkout: null,
  favorites: [],
  history: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchWorkouts = createAsyncThunk(
  'workout/fetchWorkouts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await workoutService.getWorkouts();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch workouts');
    }
  }
);

export const fetchWorkoutById = createAsyncThunk(
  'workout/fetchWorkoutById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await workoutService.getWorkoutById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch workout');
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'workout/addToFavorites',
  async (workoutId: string, { rejectWithValue }) => {
    try {
      await workoutService.addToFavorites(workoutId);
      return workoutId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to favorites');
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'workout/removeFromFavorites',
  async (workoutId: string, { rejectWithValue }) => {
    try {
      await workoutService.removeFromFavorites(workoutId);
      return workoutId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from favorites');
    }
  }
);

export const completeWorkout = createAsyncThunk(
  'workout/completeWorkout',
  async (workoutHistory: Omit<WorkoutHistory, 'id'>, { rejectWithValue }) => {
    try {
      const response = await workoutService.completeWorkout(workoutHistory);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete workout');
    }
  }
);

export const fetchWorkoutHistory = createAsyncThunk(
  'workout/fetchWorkoutHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await workoutService.getWorkoutHistory();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch workout history');
    }
  }
);

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    setCurrentWorkout: (state, action: PayloadAction<Workout | null>) => {
      state.currentWorkout = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateWorkoutProgress: (state, action: PayloadAction<{ workoutId: string; progress: number }>) => {
      const workout = state.workouts.find(w => w.id === action.payload.workoutId);
      if (workout) {
        // Update progress logic here
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch workouts
      .addCase(fetchWorkouts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkouts.fulfilled, (state, action: PayloadAction<Workout[]>) => {
        state.isLoading = false;
        state.workouts = action.payload;
        state.error = null;
      })
      .addCase(fetchWorkouts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch workout by ID
      .addCase(fetchWorkoutById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkoutById.fulfilled, (state, action: PayloadAction<Workout>) => {
        state.isLoading = false;
        state.currentWorkout = action.payload;
        state.error = null;
      })
      .addCase(fetchWorkoutById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add to favorites
      .addCase(addToFavorites.fulfilled, (state, action: PayloadAction<string>) => {
        state.favorites.push(action.payload);
      })
      // Remove from favorites
      .addCase(removeFromFavorites.fulfilled, (state, action: PayloadAction<string>) => {
        state.favorites = state.favorites.filter(id => id !== action.payload);
      })
      // Complete workout
      .addCase(completeWorkout.fulfilled, (state, action: PayloadAction<WorkoutHistory>) => {
        state.history.unshift(action.payload);
      })
      // Fetch workout history
      .addCase(fetchWorkoutHistory.fulfilled, (state, action: PayloadAction<WorkoutHistory[]>) => {
        state.history = action.payload;
      });
  },
});

export const { setCurrentWorkout, clearError, updateWorkoutProgress } = workoutSlice.actions;
export default workoutSlice.reducer;