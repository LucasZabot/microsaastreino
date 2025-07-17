import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Any, Optional, Tuple
import json
from datetime import datetime, timedelta
import random
from app.models.user import User, ExperienceLevel, FitnessGoal
from app.models.workout import Exercise, Workout, WorkoutExercise, ExerciseType, MuscleGroup, ProgressRecord
from app.ai.profile_analyzer import UserProfileAnalyzer

class WorkoutPrescriber:
    """
    Classe responsável pela prescrição automática de treinos usando IA.
    Analisa o perfil do usuário, histórico de progresso e gera treinos personalizados.
    """
    
    def __init__(self):
        self.profile_analyzer = UserProfileAnalyzer()
        self.exercise_selector = ExerciseSelector()
        self.progression_engine = ProgressionEngine()
        self.load_balancer = LoadBalancer()
        
        # Parâmetros de configuração
        self.intensity_factors = {
            ExperienceLevel.BEGINNER: 0.6,
            ExperienceLevel.INTERMEDIATE: 0.75,
            ExperienceLevel.ADVANCED: 0.9
        }
        
        self.volume_factors = {
            FitnessGoal.WEIGHT_LOSS: 1.2,
            FitnessGoal.MUSCLE_GAIN: 1.0,
            FitnessGoal.STRENGTH: 0.8,
            FitnessGoal.ENDURANCE: 1.3,
            FitnessGoal.GENERAL_FITNESS: 1.0
        }
    
    def prescribe_workout(self, user: User, exercises: List[Exercise], 
                         progress_history: List[ProgressRecord] = None,
                         preferences: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Prescreve um treino personalizado baseado no perfil do usuário
        """
        # Analisar perfil do usuário
        profile_analysis = self.profile_analyzer.analyze_user_profile(user, progress_history)
        
        # Determinar parâmetros do treino
        workout_params = self._determine_workout_parameters(user, profile_analysis, preferences)
        
        # Selecionar exercícios
        selected_exercises = self.exercise_selector.select_exercises(
            exercises, user, workout_params, progress_history
        )
        
        # Calcular volume e intensidade
        workout_prescription = self._calculate_workout_prescription(
            selected_exercises, user, workout_params, progress_history
        )
        
        # Aplicar progressão
        if progress_history:
            workout_prescription = self.progression_engine.apply_progression(
                workout_prescription, user, progress_history
            )
        
        # Balancear carga
        workout_prescription = self.load_balancer.balance_workout_load(
            workout_prescription, user, profile_analysis
        )
        
        # Gerar insights de IA
        ai_insights = self._generate_ai_insights(
            user, workout_prescription, profile_analysis
        )
        
        # Gerar recomendações
        recommendations = self._generate_workout_recommendations(
            user, workout_prescription, profile_analysis
        )
        
        return {
            'workout_prescription': workout_prescription,
            'ai_insights': ai_insights,
            'recommendations': recommendations,
            'profile_analysis': profile_analysis,
            'prescription_metadata': {
                'algorithm_version': '1.0',
                'created_at': datetime.utcnow().isoformat(),
                'confidence_score': self._calculate_confidence_score(workout_prescription, user)
            }
        }
    
    def _determine_workout_parameters(self, user: User, profile_analysis: Dict[str, Any], 
                                    preferences: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Determina parâmetros específicos do treino baseado no perfil
        """
        preferences = preferences or {}
        
        # Determinar tipo de treino principal
        primary_type = self._determine_primary_workout_type(user, preferences)
        
        # Calcular duração efetiva
        effective_duration = min(user.session_duration, 90)  # Máximo 90 minutos
        
        # Determinar grupos musculares alvo
        target_muscles = self._determine_target_muscles(user, preferences)
        
        # Calcular intensidade base
        base_intensity = self.intensity_factors[user.experience_level]
        
        # Ajustar intensidade baseada no objetivo
        intensity_adjustment = {
            FitnessGoal.WEIGHT_LOSS: 0.1,
            FitnessGoal.MUSCLE_GAIN: 0.0,
            FitnessGoal.STRENGTH: 0.15,
            FitnessGoal.ENDURANCE: -0.05,
            FitnessGoal.GENERAL_FITNESS: 0.0
        }
        
        target_intensity = base_intensity + intensity_adjustment.get(user.fitness_goal, 0.0)
        target_intensity = max(0.4, min(0.95, target_intensity))
        
        # Calcular volume alvo
        base_volume = self._calculate_base_volume(user, effective_duration)
        volume_multiplier = self.volume_factors[user.fitness_goal]
        target_volume = base_volume * volume_multiplier
        
        return {
            'primary_type': primary_type,
            'target_muscles': target_muscles,
            'duration_minutes': effective_duration,
            'target_intensity': target_intensity,
            'target_volume': target_volume,
            'exercise_count': self._calculate_exercise_count(user, effective_duration),
            'rest_periods': self._calculate_rest_periods(user, primary_type),
            'warm_up_required': True,
            'cool_down_required': True
        }
    
    def _determine_primary_workout_type(self, user: User, preferences: Dict[str, Any]) -> ExerciseType:
        """Determina o tipo principal do treino"""
        if 'workout_type' in preferences:
            return preferences['workout_type']
        
        # Mapear objetivo para tipo de treino
        goal_to_type = {
            FitnessGoal.WEIGHT_LOSS: ExerciseType.HIIT,
            FitnessGoal.MUSCLE_GAIN: ExerciseType.STRENGTH,
            FitnessGoal.STRENGTH: ExerciseType.STRENGTH,
            FitnessGoal.ENDURANCE: ExerciseType.CARDIO,
            FitnessGoal.GENERAL_FITNESS: ExerciseType.FUNCTIONAL
        }
        
        return goal_to_type.get(user.fitness_goal, ExerciseType.FUNCTIONAL)
    
    def _determine_target_muscles(self, user: User, preferences: Dict[str, Any]) -> List[MuscleGroup]:
        """Determina grupos musculares alvo"""
        if 'target_muscle_groups' in preferences:
            return preferences['target_muscle_groups']
        
        # Distribuição baseada no objetivo
        if user.fitness_goal == FitnessGoal.MUSCLE_GAIN:
            return [MuscleGroup.CHEST, MuscleGroup.BACK, MuscleGroup.LEGS, MuscleGroup.SHOULDERS]
        elif user.fitness_goal == FitnessGoal.STRENGTH:
            return [MuscleGroup.CHEST, MuscleGroup.BACK, MuscleGroup.LEGS]
        elif user.fitness_goal == FitnessGoal.WEIGHT_LOSS:
            return [MuscleGroup.FULL_BODY, MuscleGroup.CORE, MuscleGroup.LEGS]
        else:
            return [MuscleGroup.FULL_BODY, MuscleGroup.CORE]
    
    def _calculate_base_volume(self, user: User, duration: int) -> float:
        """Calcula volume base do treino"""
        # Volume base em sets por minuto
        volume_per_minute = {
            ExperienceLevel.BEGINNER: 0.3,
            ExperienceLevel.INTERMEDIATE: 0.4,
            ExperienceLevel.ADVANCED: 0.5
        }
        
        return duration * volume_per_minute[user.experience_level]
    
    def _calculate_exercise_count(self, user: User, duration: int) -> int:
        """Calcula número de exercícios"""
        exercises_per_minute = {
            ExperienceLevel.BEGINNER: 0.12,
            ExperienceLevel.INTERMEDIATE: 0.15,
            ExperienceLevel.ADVANCED: 0.18
        }
        
        count = int(duration * exercises_per_minute[user.experience_level])
        return max(4, min(12, count))
    
    def _calculate_rest_periods(self, user: User, workout_type: ExerciseType) -> Dict[str, int]:
        """Calcula períodos de descanso"""
        base_rest = {
            ExerciseType.STRENGTH: 90,
            ExerciseType.HIIT: 30,
            ExerciseType.CARDIO: 60,
            ExerciseType.FUNCTIONAL: 45,
            ExerciseType.FLEXIBILITY: 30
        }
        
        experience_modifier = {
            ExperienceLevel.BEGINNER: 1.2,
            ExperienceLevel.INTERMEDIATE: 1.0,
            ExperienceLevel.ADVANCED: 0.8
        }
        
        base_time = base_rest.get(workout_type, 60)
        modified_time = int(base_time * experience_modifier[user.experience_level])
        
        return {
            'between_sets': modified_time,
            'between_exercises': modified_time + 15,
            'between_muscle_groups': modified_time + 30
        }
    
    def _calculate_workout_prescription(self, exercises: List[Exercise], user: User, 
                                      params: Dict[str, Any], 
                                      progress_history: List[ProgressRecord]) -> Dict[str, Any]:
        """
        Calcula prescrição completa do treino (sets, reps, peso, etc.)
        """
        workout_exercises = []
        
        for i, exercise in enumerate(exercises):
            prescription = self._calculate_exercise_prescription(
                exercise, user, params, progress_history, i
            )
            workout_exercises.append(prescription)
        
        # Calcular métricas totais
        total_duration = sum(ex['estimated_duration'] for ex in workout_exercises)
        total_volume = sum(ex['volume'] for ex in workout_exercises)
        total_calories = sum(ex['calories'] for ex in workout_exercises)
        
        return {
            'exercises': workout_exercises,
            'total_duration': total_duration,
            'total_volume': total_volume,
            'total_calories': total_calories,
            'difficulty_score': self._calculate_difficulty_score(workout_exercises, user),
            'parameters': params
        }
    
    def _calculate_exercise_prescription(self, exercise: Exercise, user: User, 
                                       params: Dict[str, Any], 
                                       progress_history: List[ProgressRecord],
                                       exercise_order: int) -> Dict[str, Any]:
        """
        Calcula prescrição específica para um exercício
        """
        # Determinar sets baseado no tipo de exercício e objetivo
        sets = self._calculate_sets(exercise, user, params)
        
        # Determinar reps baseado no objetivo
        reps = self._calculate_reps(exercise, user, params)
        
        # Determinar peso (se aplicável)
        weight = self._calculate_weight(exercise, user, params, progress_history)
        
        # Determinar duração (para exercícios de cardio)
        duration = self._calculate_duration(exercise, user, params)
        
        # Calcular tempo de descanso
        rest_time = self._calculate_rest_time(exercise, user, params, exercise_order)
        
        # Calcular volume (sets × reps × peso)
        volume = sets * reps * (weight if weight else 1)
        
        # Estimar duração total
        estimated_duration = self._estimate_exercise_duration(
            exercise, sets, reps, duration, rest_time
        )
        
        # Estimar calorias
        calories = self._estimate_calories(exercise, user, estimated_duration)
        
        return {
            'exercise_id': exercise.id,
            'exercise_name': exercise.name,
            'sets': sets,
            'reps': reps,
            'weight': weight,
            'duration': duration,
            'rest_time': rest_time,
            'volume': volume,
            'estimated_duration': estimated_duration,
            'calories': calories,
            'intensity_percentage': self._calculate_intensity_percentage(exercise, user, weight),
            'instructions': exercise.instructions,
            'tips': exercise.tips,
            'order': exercise_order + 1
        }
    
    def _calculate_sets(self, exercise: Exercise, user: User, params: Dict[str, Any]) -> int:
        """Calcula número de sets"""
        base_sets = {
            ExerciseType.STRENGTH: 3,
            ExerciseType.HIIT: 4,
            ExerciseType.CARDIO: 1,
            ExerciseType.FUNCTIONAL: 3,
            ExerciseType.FLEXIBILITY: 2
        }
        
        sets = base_sets.get(exercise.exercise_type, 3)
        
        # Ajustar baseado no nível de experiência
        if user.experience_level == ExperienceLevel.BEGINNER:
            sets = max(1, sets - 1)
        elif user.experience_level == ExperienceLevel.ADVANCED:
            sets = min(5, sets + 1)
        
        return sets
    
    def _calculate_reps(self, exercise: Exercise, user: User, params: Dict[str, Any]) -> int:
        """Calcula número de repetições"""
        goal_to_reps = {
            FitnessGoal.STRENGTH: (3, 6),
            FitnessGoal.MUSCLE_GAIN: (8, 12),
            FitnessGoal.ENDURANCE: (15, 25),
            FitnessGoal.WEIGHT_LOSS: (12, 18),
            FitnessGoal.GENERAL_FITNESS: (10, 15)
        }
        
        rep_range = goal_to_reps.get(user.fitness_goal, (10, 15))
        
        # Ajustar baseado no tipo de exercício
        if exercise.exercise_type == ExerciseType.HIIT:
            rep_range = (45, 60)  # segundos para HIIT
        elif exercise.exercise_type == ExerciseType.CARDIO:
            rep_range = (300, 1200)  # segundos para cardio
        
        return random.randint(rep_range[0], rep_range[1])
    
    def _calculate_weight(self, exercise: Exercise, user: User, params: Dict[str, Any], 
                         progress_history: List[ProgressRecord]) -> Optional[float]:
        """Calcula peso para exercícios de força"""
        if exercise.exercise_type != ExerciseType.STRENGTH:
            return None
        
        # Estimar peso baseado no peso corporal e nível de experiência
        bodyweight_multipliers = {
            ExperienceLevel.BEGINNER: 0.3,
            ExperienceLevel.INTERMEDIATE: 0.6,
            ExperienceLevel.ADVANCED: 0.9
        }
        
        # Multiplicadores específicos por músculo
        muscle_multipliers = {
            MuscleGroup.CHEST: 0.8,
            MuscleGroup.BACK: 0.7,
            MuscleGroup.LEGS: 1.2,
            MuscleGroup.SHOULDERS: 0.4,
            MuscleGroup.BICEPS: 0.3,
            MuscleGroup.TRICEPS: 0.35
        }
        
        base_weight = user.weight * bodyweight_multipliers[user.experience_level]
        muscle_modifier = muscle_multipliers.get(exercise.primary_muscle_group, 0.5)
        
        estimated_weight = base_weight * muscle_modifier
        
        # Ajustar baseado no histórico de progresso
        if progress_history:
            # Verificar progressos anteriores com exercícios similares
            similar_exercises = [p for p in progress_history 
                               if hasattr(p, 'workout') and p.workout]
            
            if similar_exercises:
                # Lógica de progressão baseada no histórico
                estimated_weight *= 1.05  # Pequeno aumento progressivo
        
        return round(estimated_weight, 2.5)  # Arredondar para 2.5kg
    
    def _calculate_duration(self, exercise: Exercise, user: User, params: Dict[str, Any]) -> Optional[int]:
        """Calcula duração para exercícios de cardio"""
        if exercise.exercise_type not in [ExerciseType.CARDIO, ExerciseType.HIIT]:
            return None
        
        duration_by_goal = {
            FitnessGoal.WEIGHT_LOSS: 20,
            FitnessGoal.ENDURANCE: 30,
            FitnessGoal.GENERAL_FITNESS: 15
        }
        
        base_duration = duration_by_goal.get(user.fitness_goal, 15)
        
        # Ajustar baseado no nível de experiência
        if user.experience_level == ExperienceLevel.BEGINNER:
            base_duration = int(base_duration * 0.7)
        elif user.experience_level == ExperienceLevel.ADVANCED:
            base_duration = int(base_duration * 1.3)
        
        return base_duration * 60  # Converter para segundos
    
    def _calculate_rest_time(self, exercise: Exercise, user: User, params: Dict[str, Any], 
                           exercise_order: int) -> int:
        """Calcula tempo de descanso"""
        base_rest = params['rest_periods']['between_sets']
        
        # Ajustar baseado no tipo de exercício
        if exercise.exercise_type == ExerciseType.HIIT:
            base_rest = int(base_rest * 0.3)
        elif exercise.exercise_type == ExerciseType.STRENGTH:
            base_rest = int(base_rest * 1.2)
        
        return base_rest
    
    def _estimate_exercise_duration(self, exercise: Exercise, sets: int, reps: int, 
                                  duration: Optional[int], rest_time: int) -> int:
        """Estima duração total do exercício"""
        if duration:
            return duration + (rest_time * (sets - 1))
        
        # Estimar tempo por rep
        time_per_rep = 3  # segundos por rep
        if exercise.exercise_type == ExerciseType.HIIT:
            time_per_rep = 1  # HIIT é mais rápido
        
        work_time = sets * reps * time_per_rep
        rest_time_total = rest_time * (sets - 1)
        
        return work_time + rest_time_total
    
    def _estimate_calories(self, exercise: Exercise, user: User, duration_seconds: int) -> float:
        """Estima calorias queimadas"""
        # Usar valor base do exercício ou estimar
        calories_per_minute = exercise.calories_per_minute or self._estimate_calories_per_minute(exercise, user)
        
        duration_minutes = duration_seconds / 60
        return calories_per_minute * duration_minutes
    
    def _estimate_calories_per_minute(self, exercise: Exercise, user: User) -> float:
        """Estima calorias por minuto baseado no exercício e usuário"""
        # Multiplicador baseado no peso corporal
        weight_factor = user.weight / 70  # 70kg como referência
        
        # Multiplicador baseado no tipo de exercício
        type_multipliers = {
            ExerciseType.STRENGTH: 5,
            ExerciseType.HIIT: 12,
            ExerciseType.CARDIO: 8,
            ExerciseType.FUNCTIONAL: 6,
            ExerciseType.FLEXIBILITY: 2
        }
        
        base_calories = type_multipliers.get(exercise.exercise_type, 5)
        return base_calories * weight_factor
    
    def _calculate_intensity_percentage(self, exercise: Exercise, user: User, weight: Optional[float]) -> float:
        """Calcula porcentagem de intensidade"""
        if not weight:
            return 70.0  # Intensidade padrão para exercícios sem peso
        
        # Estimar 1RM baseado no peso corporal
        estimated_1rm = self._estimate_1rm(exercise, user)
        
        if estimated_1rm:
            intensity = (weight / estimated_1rm) * 100
            return min(95, max(40, intensity))
        
        return 70.0
    
    def _estimate_1rm(self, exercise: Exercise, user: User) -> Optional[float]:
        """Estima 1RM do usuário para um exercício"""
        # Multiplicadores de 1RM baseados no peso corporal
        rm_multipliers = {
            MuscleGroup.CHEST: 1.3,
            MuscleGroup.BACK: 1.1,
            MuscleGroup.LEGS: 1.8,
            MuscleGroup.SHOULDERS: 0.6,
            MuscleGroup.BICEPS: 0.4,
            MuscleGroup.TRICEPS: 0.5
        }
        
        experience_multipliers = {
            ExperienceLevel.BEGINNER: 0.5,
            ExperienceLevel.INTERMEDIATE: 0.75,
            ExperienceLevel.ADVANCED: 1.0
        }
        
        base_multiplier = rm_multipliers.get(exercise.primary_muscle_group, 0.8)
        experience_modifier = experience_multipliers[user.experience_level]
        
        return user.weight * base_multiplier * experience_modifier
    
    def _calculate_difficulty_score(self, exercises: List[Dict[str, Any]], user: User) -> float:
        """Calcula score de dificuldade do treino"""
        total_intensity = sum(ex['intensity_percentage'] for ex in exercises)
        avg_intensity = total_intensity / len(exercises)
        
        total_volume = sum(ex['volume'] for ex in exercises)
        volume_per_kg = total_volume / user.weight
        
        # Normalizar scores
        intensity_score = avg_intensity / 100
        volume_score = min(1.0, volume_per_kg / 10)
        
        return (intensity_score * 0.6 + volume_score * 0.4) * 100
    
    def _generate_ai_insights(self, user: User, workout: Dict[str, Any], 
                            profile_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Gera insights de IA sobre o treino"""
        insights = {
            'workout_analysis': {
                'difficulty_assessment': self._assess_workout_difficulty(workout, user),
                'volume_analysis': self._analyze_workout_volume(workout, user),
                'muscle_group_balance': self._analyze_muscle_balance(workout),
                'recovery_requirements': self._analyze_recovery_needs(workout, user)
            },
            'personalization_factors': {
                'user_profile_match': self._assess_profile_match(workout, profile_analysis),
                'goal_alignment': self._assess_goal_alignment(workout, user),
                'experience_appropriateness': self._assess_experience_level(workout, user)
            },
            'progression_insights': {
                'adaptation_timeline': self._predict_adaptation_timeline(workout, user),
                'progression_opportunities': self._identify_progression_opportunities(workout, user),
                'plateaus_risk': self._assess_plateau_risk(workout, user)
            }
        }
        
        return insights
    
    def _generate_workout_recommendations(self, user: User, workout: Dict[str, Any], 
                                        profile_analysis: Dict[str, Any]) -> List[str]:
        """Gera recomendações específicas para o treino"""
        recommendations = []
        
        # Recomendações baseadas na dificuldade
        if workout['difficulty_score'] > 80:
            recommendations.append("Este treino é desafiador. Mantenha a forma correta e não hesite em reduzir o peso se necessário.")
        
        # Recomendações baseadas no volume
        if workout['total_volume'] > 1000:
            recommendations.append("Alto volume de treino. Garanta hidratação adequada e boa recuperação.")
        
        # Recomendações baseadas no perfil
        if user.experience_level == ExperienceLevel.BEGINNER:
            recommendations.append("Foque na técnica correta antes de aumentar o peso. Qualidade sobre quantidade.")
        
        # Recomendações baseadas no objetivo
        if user.fitness_goal == FitnessGoal.WEIGHT_LOSS:
            recommendations.append("Mantenha intensidade alta e minimize o tempo de descanso para maximizar queima calórica.")
        
        return recommendations
    
    def _assess_workout_difficulty(self, workout: Dict[str, Any], user: User) -> str:
        """Avalia dificuldade do treino"""
        score = workout['difficulty_score']
        
        if score < 50:
            return "Fácil"
        elif score < 70:
            return "Moderado"
        elif score < 85:
            return "Desafiador"
        else:
            return "Muito Difícil"
    
    def _analyze_workout_volume(self, workout: Dict[str, Any], user: User) -> Dict[str, Any]:
        """Analisa volume do treino"""
        total_volume = workout['total_volume']
        volume_per_kg = total_volume / user.weight
        
        return {
            'total_volume': total_volume,
            'volume_per_kg': round(volume_per_kg, 2),
            'classification': self._classify_volume(volume_per_kg, user)
        }
    
    def _classify_volume(self, volume_per_kg: float, user: User) -> str:
        """Classifica o volume do treino"""
        thresholds = {
            ExperienceLevel.BEGINNER: (2, 5),
            ExperienceLevel.INTERMEDIATE: (4, 8),
            ExperienceLevel.ADVANCED: (6, 12)
        }
        
        low, high = thresholds[user.experience_level]
        
        if volume_per_kg < low:
            return "Baixo"
        elif volume_per_kg < high:
            return "Moderado"
        else:
            return "Alto"
    
    def _analyze_muscle_balance(self, workout: Dict[str, Any]) -> Dict[str, Any]:
        """Analisa equilíbrio entre grupos musculares"""
        muscle_groups = {}
        
        for exercise in workout['exercises']:
            # Simulação - em produção, pegaria do banco
            muscle_group = "chest"  # exercise.primary_muscle_group
            muscle_groups[muscle_group] = muscle_groups.get(muscle_group, 0) + 1
        
        return {
            'muscle_distribution': muscle_groups,
            'balance_score': self._calculate_balance_score(muscle_groups),
            'recommendations': self._generate_balance_recommendations(muscle_groups)
        }
    
    def _calculate_balance_score(self, muscle_groups: Dict[str, int]) -> float:
        """Calcula score de equilíbrio muscular"""
        if not muscle_groups:
            return 0.0
        
        values = list(muscle_groups.values())
        mean_value = sum(values) / len(values)
        variance = sum((v - mean_value) ** 2 for v in values) / len(values)
        
        # Score inverso da variância (menor variância = melhor equilíbrio)
        return max(0, 100 - (variance * 10))
    
    def _generate_balance_recommendations(self, muscle_groups: Dict[str, int]) -> List[str]:
        """Gera recomendações para equilíbrio muscular"""
        recommendations = []
        
        if not muscle_groups:
            return recommendations
        
        max_count = max(muscle_groups.values())
        min_count = min(muscle_groups.values())
        
        if max_count - min_count > 2:
            recommendations.append("Considere incluir mais exercícios para grupos musculares menos trabalhados.")
        
        return recommendations
    
    def _analyze_recovery_needs(self, workout: Dict[str, Any], user: User) -> Dict[str, Any]:
        """Analisa necessidades de recuperação"""
        intensity_score = workout['difficulty_score']
        duration = workout['total_duration']
        
        # Estimar tempo de recuperação
        recovery_hours = self._estimate_recovery_time(intensity_score, duration, user)
        
        return {
            'estimated_recovery_hours': recovery_hours,
            'recovery_recommendations': self._generate_recovery_recommendations(recovery_hours, user),
            'next_workout_readiness': self._predict_next_workout_readiness(recovery_hours)
        }
    
    def _estimate_recovery_time(self, intensity: float, duration: int, user: User) -> int:
        """Estima tempo de recuperação em horas"""
        base_recovery = 24  # 24 horas base
        
        # Ajustar baseado na intensidade
        intensity_modifier = (intensity / 100) * 24
        
        # Ajustar baseado na duração
        duration_modifier = (duration / 60) * 2
        
        # Ajustar baseado no nível de experiência
        experience_modifier = {
            ExperienceLevel.BEGINNER: 1.3,
            ExperienceLevel.INTERMEDIATE: 1.0,
            ExperienceLevel.ADVANCED: 0.8
        }
        
        total_recovery = base_recovery + intensity_modifier + duration_modifier
        total_recovery *= experience_modifier[user.experience_level]
        
        return int(total_recovery)
    
    def _generate_recovery_recommendations(self, recovery_hours: int, user: User) -> List[str]:
        """Gera recomendações de recuperação"""
        recommendations = []
        
        if recovery_hours > 48:
            recommendations.append("Recuperação longa necessária. Considere treino leve nos próximos dias.")
        
        recommendations.extend([
            "Mantenha hidratação adequada",
            "Garanta sono de qualidade",
            "Considere alongamento leve"
        ])
        
        return recommendations
    
    def _predict_next_workout_readiness(self, recovery_hours: int) -> str:
        """Prediz quando o usuário estará pronto para próximo treino"""
        if recovery_hours < 24:
            return "Pronto para treino intenso amanhã"
        elif recovery_hours < 48:
            return "Pronto para treino moderado em 1-2 dias"
        else:
            return "Necessário 2-3 dias de recuperação"
    
    def _assess_profile_match(self, workout: Dict[str, Any], profile_analysis: Dict[str, Any]) -> float:
        """Avalia quanto o treino combina com o perfil do usuário"""
        # Simulação - em produção, usaria análise mais complexa
        return 85.0
    
    def _assess_goal_alignment(self, workout: Dict[str, Any], user: User) -> float:
        """Avalia alinhamento com objetivos do usuário"""
        # Simulação - em produção, analisaria exercícios específicos
        return 90.0
    
    def _assess_experience_level(self, workout: Dict[str, Any], user: User) -> float:
        """Avalia adequação ao nível de experiência"""
        difficulty = workout['difficulty_score']
        
        target_difficulty = {
            ExperienceLevel.BEGINNER: 55,
            ExperienceLevel.INTERMEDIATE: 70,
            ExperienceLevel.ADVANCED: 85
        }
        
        target = target_difficulty[user.experience_level]
        deviation = abs(difficulty - target)
        
        return max(0, 100 - deviation)
    
    def _predict_adaptation_timeline(self, workout: Dict[str, Any], user: User) -> str:
        """Prediz timeline de adaptação"""
        difficulty = workout['difficulty_score']
        
        if difficulty < 60:
            return "Adaptação em 1-2 semanas"
        elif difficulty < 80:
            return "Adaptação em 2-3 semanas"
        else:
            return "Adaptação em 3-4 semanas"
    
    def _identify_progression_opportunities(self, workout: Dict[str, Any], user: User) -> List[str]:
        """Identifica oportunidades de progressão"""
        opportunities = []
        
        for exercise in workout['exercises']:
            if exercise['intensity_percentage'] < 70:
                opportunities.append(f"Aumentar peso em {exercise['exercise_name']}")
        
        return opportunities
    
    def _assess_plateau_risk(self, workout: Dict[str, Any], user: User) -> str:
        """Avalia risco de plateau"""
        # Simulação - em produção, analisaria histórico
        return "Baixo"
    
    def _calculate_confidence_score(self, workout: Dict[str, Any], user: User) -> float:
        """Calcula score de confiança da prescrição"""
        # Fatores que influenciam a confiança
        factors = []
        
        # Completude do perfil
        profile_completeness = 0.9  # Simulado
        factors.append(profile_completeness)
        
        # Adequação da dificuldade
        difficulty_adequacy = 0.85  # Simulado
        factors.append(difficulty_adequacy)
        
        # Equilíbrio do treino
        balance_score = 0.8  # Simulado
        factors.append(balance_score)
        
        return sum(factors) / len(factors) * 100


class ExerciseSelector:
    """Classe responsável por selecionar exercícios apropriados"""
    
    def select_exercises(self, exercises: List[Exercise], user: User, 
                        params: Dict[str, Any], progress_history: List[ProgressRecord]) -> List[Exercise]:
        """Seleciona exercícios apropriados para o usuário"""
        # Filtrar por tipo de treino
        filtered_exercises = self._filter_by_workout_type(exercises, params['primary_type'])
        
        # Filtrar por grupos musculares alvo
        filtered_exercises = self._filter_by_muscle_groups(filtered_exercises, params['target_muscles'])
        
        # Filtrar por nível de experiência
        filtered_exercises = self._filter_by_experience(filtered_exercises, user)
        
        # Evitar exercícios problemáticos
        filtered_exercises = self._filter_by_limitations(filtered_exercises, user)
        
        # Selecionar exercícios finais
        selected = self._select_final_exercises(filtered_exercises, params['exercise_count'], user)
        
        return selected
    
    def _filter_by_workout_type(self, exercises: List[Exercise], workout_type: ExerciseType) -> List[Exercise]:
        """Filtra exercícios pelo tipo de treino"""
        return [ex for ex in exercises if ex.exercise_type == workout_type]
    
    def _filter_by_muscle_groups(self, exercises: List[Exercise], target_muscles: List[MuscleGroup]) -> List[Exercise]:
        """Filtra exercícios pelos grupos musculares alvo"""
        return [ex for ex in exercises if ex.primary_muscle_group in target_muscles]
    
    def _filter_by_experience(self, exercises: List[Exercise], user: User) -> List[Exercise]:
        """Filtra exercícios pelo nível de experiência"""
        max_difficulty = {
            ExperienceLevel.BEGINNER: 3,
            ExperienceLevel.INTERMEDIATE: 4,
            ExperienceLevel.ADVANCED: 5
        }
        
        return [ex for ex in exercises if ex.difficulty_level <= max_difficulty[user.experience_level]]
    
    def _filter_by_limitations(self, exercises: List[Exercise], user: User) -> List[Exercise]:
        """Filtra exercícios baseado em limitações do usuário"""
        if not user.injuries:
            return exercises
        
        # Simulação - em produção, teria lógica mais complexa
        return exercises
    
    def _select_final_exercises(self, exercises: List[Exercise], count: int, user: User) -> List[Exercise]:
        """Seleciona exercícios finais garantindo variedade"""
        if len(exercises) <= count:
            return exercises
        
        # Algoritmo de seleção que garante variedade
        selected = []
        muscle_groups_used = set()
        
        # Primeiro, selecionar um exercício de cada grupo muscular
        for exercise in exercises:
            if len(selected) >= count:
                break
            
            if exercise.primary_muscle_group not in muscle_groups_used:
                selected.append(exercise)
                muscle_groups_used.add(exercise.primary_muscle_group)
        
        # Completar com exercícios restantes
        remaining = [ex for ex in exercises if ex not in selected]
        while len(selected) < count and remaining:
            selected.append(remaining.pop(0))
        
        return selected


class ProgressionEngine:
    """Classe responsável por aplicar progressão aos treinos"""
    
    def apply_progression(self, workout: Dict[str, Any], user: User, 
                         progress_history: List[ProgressRecord]) -> Dict[str, Any]:
        """Aplica lógica de progressão baseada no histórico"""
        # Analisar performance recente
        recent_performance = self._analyze_recent_performance(progress_history)
        
        # Aplicar progressão aos exercícios
        for exercise in workout['exercises']:
            exercise = self._apply_exercise_progression(exercise, recent_performance, user)
        
        # Recalcular métricas do treino
        workout = self._recalculate_workout_metrics(workout)
        
        return workout
    
    def _analyze_recent_performance(self, progress_history: List[ProgressRecord]) -> Dict[str, Any]:
        """Analisa performance recente"""
        if not progress_history:
            return {'trend': 'stable', 'completion_rate': 0.8}
        
        # Pegar últimos 5 treinos
        recent = progress_history[-5:]
        
        completion_rates = [p.completion_percentage for p in recent]
        avg_completion = sum(completion_rates) / len(completion_rates)
        
        # Determinar tendência
        if len(recent) >= 3:
            trend = 'improving' if completion_rates[-1] > completion_rates[0] else 'stable'
        else:
            trend = 'stable'
        
        return {
            'trend': trend,
            'completion_rate': avg_completion / 100,
            'satisfaction': sum(p.satisfaction_rating for p in recent) / len(recent)
        }
    
    def _apply_exercise_progression(self, exercise: Dict[str, Any], performance: Dict[str, Any], 
                                   user: User) -> Dict[str, Any]:
        """Aplica progressão a um exercício específico"""
        if performance['completion_rate'] > 0.9 and performance['trend'] == 'improving':
            # Usuário está indo bem, pode progredir
            if exercise['weight']:
                exercise['weight'] *= 1.05  # Aumentar peso em 5%
            else:
                exercise['reps'] = int(exercise['reps'] * 1.1)  # Aumentar reps em 10%
        elif performance['completion_rate'] < 0.7:
            # Usuário está com dificuldade, reduzir
            if exercise['weight']:
                exercise['weight'] *= 0.95  # Reduzir peso em 5%
            else:
                exercise['reps'] = int(exercise['reps'] * 0.9)  # Reduzir reps em 10%
        
        return exercise
    
    def _recalculate_workout_metrics(self, workout: Dict[str, Any]) -> Dict[str, Any]:
        """Recalcula métricas do treino após progressão"""
        total_volume = sum(ex['volume'] for ex in workout['exercises'])
        workout['total_volume'] = total_volume
        
        return workout


class LoadBalancer:
    """Classe responsável por balancear a carga do treino"""
    
    def balance_workout_load(self, workout: Dict[str, Any], user: User, 
                           profile_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Balanceia a carga do treino"""
        # Verificar se o treino não está muito pesado
        if workout['difficulty_score'] > 90:
            workout = self._reduce_workout_intensity(workout, user)
        
        # Verificar se o treino não está muito leve
        elif workout['difficulty_score'] < 40:
            workout = self._increase_workout_intensity(workout, user)
        
        return workout
    
    def _reduce_workout_intensity(self, workout: Dict[str, Any], user: User) -> Dict[str, Any]:
        """Reduz intensidade do treino"""
        for exercise in workout['exercises']:
            if exercise['weight']:
                exercise['weight'] *= 0.9
            exercise['sets'] = max(1, exercise['sets'] - 1)
        
        return self._recalculate_workout_metrics(workout)
    
    def _increase_workout_intensity(self, workout: Dict[str, Any], user: User) -> Dict[str, Any]:
        """Aumenta intensidade do treino"""
        for exercise in workout['exercises']:
            if exercise['weight']:
                exercise['weight'] *= 1.1
            exercise['sets'] = min(5, exercise['sets'] + 1)
        
        return self._recalculate_workout_metrics(workout)
    
    def _recalculate_workout_metrics(self, workout: Dict[str, Any]) -> Dict[str, Any]:
        """Recalcula métricas do treino"""
        total_volume = sum(ex['volume'] for ex in workout['exercises'])
        workout['total_volume'] = total_volume
        
        return workout