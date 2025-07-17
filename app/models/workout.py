from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class ExerciseType(enum.Enum):
    CARDIO = "cardio"
    STRENGTH = "strength"
    FLEXIBILITY = "flexibility"
    FUNCTIONAL = "functional"
    HIIT = "hiit"

class MuscleGroup(enum.Enum):
    CHEST = "chest"
    BACK = "back"
    SHOULDERS = "shoulders"
    BICEPS = "biceps"
    TRICEPS = "triceps"
    LEGS = "legs"
    GLUTES = "glutes"
    CORE = "core"
    FULL_BODY = "full_body"

class Exercise(Base):
    __tablename__ = "exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    exercise_type = Column(Enum(ExerciseType))
    primary_muscle_group = Column(Enum(MuscleGroup))
    secondary_muscle_groups = Column(Text)  # JSON string
    
    # Dados técnicos
    equipment_needed = Column(Text)  # JSON string
    difficulty_level = Column(Integer)  # 1-5
    calories_per_minute = Column(Float)
    
    # Instruções
    instructions = Column(Text)
    tips = Column(Text)
    video_url = Column(String)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relacionamentos
    workout_exercises = relationship("WorkoutExercise", back_populates="exercise")

class Workout(Base):
    __tablename__ = "workouts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    description = Column(Text)
    
    # Dados do treino
    total_duration = Column(Integer)  # minutos
    total_calories = Column(Float)
    difficulty_score = Column(Float)
    
    # Datas
    created_at = Column(DateTime, default=datetime.utcnow)
    scheduled_date = Column(DateTime)
    completed_date = Column(DateTime)
    
    # Status
    is_completed = Column(Boolean, default=False)
    is_ai_generated = Column(Boolean, default=True)
    
    # Relacionamentos
    user = relationship("User", back_populates="workouts")
    exercises = relationship("WorkoutExercise", back_populates="workout")
    progress_records = relationship("ProgressRecord", back_populates="workout")

class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    
    # Prescrição
    sets = Column(Integer)
    reps = Column(Integer)
    weight = Column(Float)  # kg
    duration = Column(Integer)  # segundos
    rest_time = Column(Integer)  # segundos
    
    # Execução
    actual_sets = Column(Integer)
    actual_reps = Column(Integer)
    actual_weight = Column(Float)
    actual_duration = Column(Integer)
    
    # Ordem no treino
    order = Column(Integer)
    
    # Relacionamentos
    workout = relationship("Workout", back_populates="exercises")
    exercise = relationship("Exercise", back_populates="workout_exercises")

class ProgressRecord(Base):
    __tablename__ = "progress_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    workout_id = Column(Integer, ForeignKey("workouts.id"))
    
    # Métricas de performance
    completion_percentage = Column(Float)
    average_rpe = Column(Float)  # Rate of Perceived Exertion (1-10)
    total_volume = Column(Float)  # volume total de treino
    
    # Dados fisiológicos
    heart_rate_avg = Column(Float)
    heart_rate_max = Column(Float)
    calories_burned = Column(Float)
    
    # Feedback
    user_feedback = Column(Text)
    difficulty_rating = Column(Integer)  # 1-5
    satisfaction_rating = Column(Integer)  # 1-5
    
    # Timestamp
    recorded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User", back_populates="progress_records")
    workout = relationship("Workout", back_populates="progress_records")