// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: SubscriptionType;
  createdAt: string;
  updatedAt: string;
}

export enum SubscriptionType {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  PRO = 'PRO'
}

// Workout types
export interface Workout {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  difficulty: DifficultyLevel;
  exercises: Exercise[];
  category: WorkoutCategory;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export enum WorkoutCategory {
  CARDIO = 'CARDIO',
  STRENGTH = 'STRENGTH',
  FLEXIBILITY = 'FLEXIBILITY',
  HIIT = 'HIIT',
  YOGA = 'YOGA',
  PILATES = 'PILATES'
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

// Exercise types
export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: number;
  duration: number; // in seconds
  restTime: number; // in seconds
  instructions: string[];
  imageUrl?: string;
  videoUrl?: string;
  equipment?: string[];
  targetMuscles: string[];
}

// Timer types
export interface TimerState {
  currentTime: number;
  isRunning: boolean;
  isResting: boolean;
  currentExercise: number;
  currentSet: number;
  totalSets: number;
  exerciseName: string;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  WorkoutList: undefined;
  WorkoutDetails: { workoutId: string };
  WorkoutPlayer: { workoutId: string };
  Timer: { exercise: Exercise };
  Profile: undefined;
  Settings: undefined;
  Subscription: undefined;
  Payment: { plan: SubscriptionPlan };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Workouts: undefined;
  Profile: undefined;
  Settings: undefined;
};

// API types
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Subscription types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: number; // in months
  features: string[];
  isPopular?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'PIX';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

// State types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface WorkoutState {
  workouts: Workout[];
  currentWorkout: Workout | null;
  favorites: string[];
  history: WorkoutHistory[];
  isLoading: boolean;
  error: string | null;
}

export interface WorkoutHistory {
  id: string;
  workoutId: string;
  workoutName: string;
  completedAt: string;
  duration: number;
  completedExercises: number;
  totalExercises: number;
}

export interface AppState {
  auth: AuthState;
  workout: WorkoutState;
  timer: TimerState;
  theme: 'light' | 'dark';
  notifications: boolean;
}

// Component props types
export interface WorkoutCardProps {
  workout: Workout;
  onPress: () => void;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
}

export interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
  showDetails?: boolean;
}

export interface TimerProps {
  exercise: Exercise;
  onComplete: () => void;
  onPause: () => void;
  onResume: () => void;
}

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

export interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  disabled?: boolean;
}