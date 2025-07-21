export interface UserData {
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  bodyFatPercentage?: number;
}

export interface CalculatedData {
  age: number;
  bmi: number;
  bmiClassification: string;
  maxHeartRate: number;
  basalMetabolicRate: number;
  bodyFatClassification?: string;
}

export interface WorkoutPlan {
  objective: 'weight_loss' | 'conditioning' | 'performance' | 'hypertrophy';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  sessionsPerWeek: number;
  sessionDuration: number;
  manualDataEntry: boolean;
  workoutSuggestion: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  duration: number;
  avgHeartRate: number;
  maxHeartRate: number;
  calories: number;
  vo2Percentage: number;
  hrPercentage: number;
  notes?: string;
}

export interface BMIClassification {
  classification: string;
  range: string;
  color: string;
}

export interface BodyFatClassification {
  gender: 'male' | 'female';
  ageRange: string;
  excellent: string;
  good: string;
  acceptable: string;
  aboveIdeal: string;
}

export interface VO2ToHRConversion {
  vo2Percentage: number;
  hrPercentage: number;
}