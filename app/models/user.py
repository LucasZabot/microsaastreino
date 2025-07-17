from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class ExperienceLevel(enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class FitnessGoal(enum.Enum):
    WEIGHT_LOSS = "weight_loss"
    MUSCLE_GAIN = "muscle_gain"
    ENDURANCE = "endurance"
    STRENGTH = "strength"
    GENERAL_FITNESS = "general_fitness"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    
    # Dados físicos
    age = Column(Integer)
    gender = Column(String)
    weight = Column(Float)  # kg
    height = Column(Float)  # cm
    body_fat_percentage = Column(Float)
    
    # Dados de fitness
    experience_level = Column(Enum(ExperienceLevel))
    fitness_goal = Column(Enum(FitnessGoal))
    available_days = Column(Integer)  # dias por semana
    session_duration = Column(Integer)  # minutos por sessão
    
    # Preferências
    preferred_exercises = Column(Text)  # JSON string
    avoided_exercises = Column(Text)   # JSON string
    injuries = Column(Text)           # JSON string
    
    # Dados calculados
    bmr = Column(Float)  # Taxa metabólica basal
    tdee = Column(Float)  # Gasto energético total diário
    bmi = Column(Float)  # Índice de massa corporal
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relacionamentos
    workouts = relationship("Workout", back_populates="user")
    progress_records = relationship("ProgressRecord", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")