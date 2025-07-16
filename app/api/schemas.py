from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class ExperienceLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class FitnessGoal(str, Enum):
    WEIGHT_LOSS = "weight_loss"
    MUSCLE_GAIN = "muscle_gain"
    ENDURANCE = "endurance"
    STRENGTH = "strength"
    GENERAL_FITNESS = "general_fitness"

class ExerciseType(str, Enum):
    CARDIO = "cardio"
    STRENGTH = "strength"
    FLEXIBILITY = "flexibility"
    FUNCTIONAL = "functional"
    HIIT = "hiit"

class MuscleGroup(str, Enum):
    CHEST = "chest"
    BACK = "back"
    SHOULDERS = "shoulders"
    BICEPS = "biceps"
    TRICEPS = "triceps"
    LEGS = "legs"
    GLUTES = "glutes"
    CORE = "core"
    FULL_BODY = "full_body"

class RecommendationType(str, Enum):
    EXERCISE = "exercise"
    NUTRITION = "nutrition"
    RECOVERY = "recovery"
    PROGRESSION = "progression"
    MOTIVATION = "motivation"

# Schemas de usuário
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str
    age: int
    gender: str
    weight: float
    height: float
    experience_level: ExperienceLevel
    fitness_goal: FitnessGoal
    available_days: int
    session_duration: int
    body_fat_percentage: Optional[float] = None
    preferred_exercises: Optional[List[str]] = []
    avoided_exercises: Optional[List[str]] = []
    injuries: Optional[List[str]] = []

class UserUpdate(BaseModel):
    weight: Optional[float] = None
    height: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    fitness_goal: Optional[FitnessGoal] = None
    available_days: Optional[int] = None
    session_duration: Optional[int] = None
    preferred_exercises: Optional[List[str]] = None
    avoided_exercises: Optional[List[str]] = None
    injuries: Optional[List[str]] = None

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    age: int
    gender: str
    weight: float
    height: float
    experience_level: ExperienceLevel
    fitness_goal: FitnessGoal
    available_days: int
    session_duration: int
    bmi: Optional[float] = None
    bmr: Optional[float] = None
    tdee: Optional[float] = None
    created_at: datetime
    
    class Config:
        orm_mode = True

# Schemas de exercício
class ExerciseCreate(BaseModel):
    name: str
    description: str
    exercise_type: ExerciseType
    primary_muscle_group: MuscleGroup
    secondary_muscle_groups: Optional[List[MuscleGroup]] = []
    equipment_needed: Optional[List[str]] = []
    difficulty_level: int
    calories_per_minute: float
    instructions: str
    tips: Optional[str] = None
    video_url: Optional[str] = None

class ExerciseResponse(BaseModel):
    id: int
    name: str
    description: str
    exercise_type: ExerciseType
    primary_muscle_group: MuscleGroup
    secondary_muscle_groups: List[MuscleGroup]
    equipment_needed: List[str]
    difficulty_level: int
    calories_per_minute: float
    instructions: str
    tips: Optional[str] = None
    video_url: Optional[str] = None
    
    class Config:
        orm_mode = True

# Schemas de treino
class WorkoutExerciseCreate(BaseModel):
    exercise_id: int
    sets: int
    reps: int
    weight: Optional[float] = None
    duration: Optional[int] = None
    rest_time: int
    order: int

class WorkoutExerciseResponse(BaseModel):
    id: int
    exercise_id: int
    sets: int
    reps: int
    weight: Optional[float] = None
    duration: Optional[int] = None
    rest_time: int
    order: int
    actual_sets: Optional[int] = None
    actual_reps: Optional[int] = None
    actual_weight: Optional[float] = None
    actual_duration: Optional[int] = None
    exercise: ExerciseResponse
    
    class Config:
        orm_mode = True

class WorkoutCreate(BaseModel):
    name: str
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    exercises: List[WorkoutExerciseCreate]

class WorkoutResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    total_duration: Optional[int] = None
    total_calories: Optional[float] = None
    difficulty_score: Optional[float] = None
    scheduled_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    is_completed: bool
    is_ai_generated: bool
    exercises: List[WorkoutExerciseResponse]
    
    class Config:
        orm_mode = True

# Schemas de progresso
class ProgressRecordCreate(BaseModel):
    workout_id: int
    completion_percentage: float
    average_rpe: float
    total_volume: float
    heart_rate_avg: Optional[float] = None
    heart_rate_max: Optional[float] = None
    calories_burned: Optional[float] = None
    user_feedback: Optional[str] = None
    difficulty_rating: int
    satisfaction_rating: int

class ProgressRecordResponse(BaseModel):
    id: int
    workout_id: int
    completion_percentage: float
    average_rpe: float
    total_volume: float
    heart_rate_avg: Optional[float] = None
    heart_rate_max: Optional[float] = None
    calories_burned: Optional[float] = None
    user_feedback: Optional[str] = None
    difficulty_rating: int
    satisfaction_rating: int
    recorded_at: datetime
    
    class Config:
        orm_mode = True

# Schemas de recomendação
class RecommendationResponse(BaseModel):
    id: int
    type: RecommendationType
    title: str
    description: str
    content: Dict[str, Any]
    priority: int
    relevance_score: float
    status: str
    created_at: datetime
    expires_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

# Schemas de métricas
class UserMetricsResponse(BaseModel):
    id: int
    user_id: int
    strength_score: float
    endurance_score: float
    flexibility_score: float
    consistency_score: float
    weight_trend: float
    body_fat_trend: float
    muscle_mass_trend: float
    sleep_quality: float
    stress_level: float
    energy_level: float
    motivation_level: float
    overall_fitness_score: float
    goal_progress_percentage: float
    recorded_at: datetime
    
    class Config:
        orm_mode = True

# Schemas de autenticação
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

# Schemas de prescrição de treino
class WorkoutPrescriptionRequest(BaseModel):
    target_muscle_groups: Optional[List[MuscleGroup]] = None
    workout_type: Optional[ExerciseType] = None
    duration_minutes: Optional[int] = None
    difficulty_override: Optional[int] = None  # 1-5
    
class WorkoutPrescriptionResponse(BaseModel):
    workout: WorkoutResponse
    ai_insights: Dict[str, Any]
    recommendations: List[str]