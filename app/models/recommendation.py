from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class RecommendationType(enum.Enum):
    EXERCISE = "exercise"
    NUTRITION = "nutrition"
    RECOVERY = "recovery"
    PROGRESSION = "progression"
    MOTIVATION = "motivation"

class RecommendationStatus(enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Dados da recomendação
    type = Column(Enum(RecommendationType))
    title = Column(String)
    description = Column(Text)
    content = Column(Text)  # JSON string com detalhes específicos
    
    # Prioridade e relevância
    priority = Column(Integer)  # 1-5 (5 = alta prioridade)
    relevance_score = Column(Float)  # 0-1 (calculado pela IA)
    
    # Status
    status = Column(Enum(RecommendationStatus), default=RecommendationStatus.PENDING)
    
    # Dados de contexto
    context_data = Column(Text)  # JSON string com dados que levaram à recomendação
    ai_model_version = Column(String)  # versão do modelo de IA usado
    
    # Feedback e resultados
    user_feedback = Column(Text)
    effectiveness_rating = Column(Integer)  # 1-5
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    acted_upon_at = Column(DateTime)
    
    # Relacionamentos
    user = relationship("User", back_populates="recommendations")

class UserMetrics(Base):
    __tablename__ = "user_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Métricas de performance
    strength_score = Column(Float)  # score normalizado 0-100
    endurance_score = Column(Float)
    flexibility_score = Column(Float)
    consistency_score = Column(Float)  # baseado na frequência de treinos
    
    # Métricas de progresso
    weight_trend = Column(Float)  # variação semanal em kg
    body_fat_trend = Column(Float)  # variação semanal em %
    muscle_mass_trend = Column(Float)  # variação semanal em kg
    
    # Métricas de bem-estar
    sleep_quality = Column(Float)  # 1-10
    stress_level = Column(Float)  # 1-10
    energy_level = Column(Float)  # 1-10
    motivation_level = Column(Float)  # 1-10
    
    # Métricas calculadas
    overall_fitness_score = Column(Float)  # score geral 0-100
    goal_progress_percentage = Column(Float)  # % de progresso para o objetivo
    
    # Timestamp
    recorded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User")

class AIModel(Base):
    __tablename__ = "ai_models"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    version = Column(String)
    model_type = Column(String)  # "recommendation", "workout_prescription", etc.
    
    # Dados do modelo
    model_data = Column(Text)  # JSON string com parâmetros do modelo
    training_data_hash = Column(String)  # hash dos dados de treino
    performance_metrics = Column(Text)  # JSON string com métricas de performance
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_trained_at = Column(DateTime)
    
    # Metadados
    description = Column(Text)
    hyperparameters = Column(Text)  # JSON string