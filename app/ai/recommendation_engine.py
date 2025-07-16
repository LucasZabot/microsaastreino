import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, List, Any, Optional, Tuple
import json
from datetime import datetime, timedelta
from dataclasses import dataclass
from app.models.user import User, ExperienceLevel, FitnessGoal
from app.models.workout import ProgressRecord
from app.models.recommendation import Recommendation, RecommendationType, UserMetrics
from app.ai.profile_analyzer import UserProfileAnalyzer

@dataclass
class RecommendationContext:
    """Contexto para geração de recomendações"""
    user: User
    profile_analysis: Dict[str, Any]
    progress_history: List[ProgressRecord]
    recent_metrics: Optional[UserMetrics]
    current_trends: Dict[str, Any]

class RecommendationEngine:
    """
    Sistema de recomendações personalizadas usando IA.
    Analisa múltiplos fatores para gerar recomendações relevantes e oportunas.
    """
    
    def __init__(self):
        self.profile_analyzer = UserProfileAnalyzer()
        self.exercise_recommender = ExerciseRecommender()
        self.nutrition_recommender = NutritionRecommender()
        self.recovery_recommender = RecoveryRecommender()
        self.progression_recommender = ProgressionRecommender()
        self.motivation_recommender = MotivationRecommender()
        
        # Configurações
        self.recommendation_weights = {
            RecommendationType.EXERCISE: 0.25,
            RecommendationType.NUTRITION: 0.20,
            RecommendationType.RECOVERY: 0.20,
            RecommendationType.PROGRESSION: 0.25,
            RecommendationType.MOTIVATION: 0.10
        }
        
        self.priority_factors = {
            'urgency': 0.3,
            'relevance': 0.4,
            'user_preference': 0.2,
            'timing': 0.1
        }
    
    def generate_recommendations(self, user: User, 
                               progress_history: List[ProgressRecord] = None,
                               user_metrics: UserMetrics = None,
                               max_recommendations: int = 10) -> List[Dict[str, Any]]:
        """
        Gera recomendações personalizadas baseadas no perfil e histórico do usuário
        """
        # Preparar contexto
        context = self._prepare_context(user, progress_history, user_metrics)
        
        # Gerar recomendações por categoria
        all_recommendations = []
        
        # Recomendações de exercícios
        exercise_recs = self.exercise_recommender.generate_recommendations(context)
        all_recommendations.extend(exercise_recs)
        
        # Recomendações de nutrição
        nutrition_recs = self.nutrition_recommender.generate_recommendations(context)
        all_recommendations.extend(nutrition_recs)
        
        # Recomendações de recuperação
        recovery_recs = self.recovery_recommender.generate_recommendations(context)
        all_recommendations.extend(recovery_recs)
        
        # Recomendações de progressão
        progression_recs = self.progression_recommender.generate_recommendations(context)
        all_recommendations.extend(progression_recs)
        
        # Recomendações de motivação
        motivation_recs = self.motivation_recommender.generate_recommendations(context)
        all_recommendations.extend(motivation_recs)
        
        # Filtrar e priorizar
        filtered_recs = self._filter_recommendations(all_recommendations, context)
        prioritized_recs = self._prioritize_recommendations(filtered_recs, context)
        
        # Personalizar conteúdo
        personalized_recs = self._personalize_content(prioritized_recs, context)
        
        # Retornar top N
        return personalized_recs[:max_recommendations]
    
    def _prepare_context(self, user: User, progress_history: List[ProgressRecord], 
                        user_metrics: UserMetrics) -> RecommendationContext:
        """Prepara contexto para geração de recomendações"""
        # Analisar perfil
        profile_analysis = self.profile_analyzer.analyze_user_profile(user, progress_history)
        
        # Analisar tendências atuais
        current_trends = self._analyze_current_trends(user, progress_history, user_metrics)
        
        return RecommendationContext(
            user=user,
            profile_analysis=profile_analysis,
            progress_history=progress_history or [],
            recent_metrics=user_metrics,
            current_trends=current_trends
        )
    
    def _analyze_current_trends(self, user: User, progress_history: List[ProgressRecord], 
                              user_metrics: UserMetrics) -> Dict[str, Any]:
        """Analisa tendências atuais do usuário"""
        trends = {
            'performance_trend': 'stable',
            'consistency_trend': 'stable',
            'motivation_trend': 'stable',
            'progress_velocity': 'normal',
            'plateau_risk': 'low'
        }
        
        if progress_history:
            # Analisar últimos 30 dias
            recent_records = [p for p in progress_history 
                            if p.recorded_at > datetime.utcnow() - timedelta(days=30)]
            
            if len(recent_records) >= 5:
                # Tendência de performance
                completion_rates = [p.completion_percentage for p in recent_records]
                if completion_rates[-1] > completion_rates[0]:
                    trends['performance_trend'] = 'improving'
                elif completion_rates[-1] < completion_rates[0]:
                    trends['performance_trend'] = 'declining'
                
                # Tendência de consistência
                weekly_counts = self._calculate_weekly_workout_counts(recent_records)
                if len(weekly_counts) >= 2:
                    if weekly_counts[-1] > weekly_counts[0]:
                        trends['consistency_trend'] = 'improving'
                    elif weekly_counts[-1] < weekly_counts[0]:
                        trends['consistency_trend'] = 'declining'
                
                # Risco de plateau
                avg_satisfaction = np.mean([p.satisfaction_rating for p in recent_records])
                if avg_satisfaction < 3:
                    trends['plateau_risk'] = 'high'
        
        return trends
    
    def _calculate_weekly_workout_counts(self, progress_records: List[ProgressRecord]) -> List[int]:
        """Calcula contagem semanal de treinos"""
        # Agrupar por semana
        weekly_counts = {}
        for record in progress_records:
            week = record.recorded_at.isocalendar()[1]
            weekly_counts[week] = weekly_counts.get(week, 0) + 1
        
        return list(weekly_counts.values())
    
    def _filter_recommendations(self, recommendations: List[Dict[str, Any]], 
                              context: RecommendationContext) -> List[Dict[str, Any]]:
        """Filtra recomendações baseadas em critérios específicos"""
        filtered = []
        
        for rec in recommendations:
            # Filtrar por relevância mínima
            if rec['relevance_score'] < 0.3:
                continue
            
            # Filtrar por timing
            if not self._is_appropriate_timing(rec, context):
                continue
            
            # Filtrar duplicatas
            if not self._is_duplicate(rec, filtered):
                filtered.append(rec)
        
        return filtered
    
    def _is_appropriate_timing(self, recommendation: Dict[str, Any], 
                             context: RecommendationContext) -> bool:
        """Verifica se é o momento apropriado para a recomendação"""
        rec_type = recommendation['type']
        
        # Recomendações de recuperação são mais relevantes após treinos intensos
        if rec_type == RecommendationType.RECOVERY:
            if context.progress_history:
                last_workout = context.progress_history[-1]
                if last_workout.recorded_at > datetime.utcnow() - timedelta(hours=24):
                    return True
        
        # Recomendações de progressão são relevantes após período de estagnação
        if rec_type == RecommendationType.PROGRESSION:
            if context.current_trends['plateau_risk'] == 'high':
                return True
        
        return True  # Por padrão, timing é apropriado
    
    def _is_duplicate(self, recommendation: Dict[str, Any], 
                     existing: List[Dict[str, Any]]) -> bool:
        """Verifica se é recomendação duplicada"""
        for existing_rec in existing:
            if (recommendation['type'] == existing_rec['type'] and
                recommendation['title'] == existing_rec['title']):
                return True
        return False
    
    def _prioritize_recommendations(self, recommendations: List[Dict[str, Any]], 
                                  context: RecommendationContext) -> List[Dict[str, Any]]:
        """Prioriza recomendações baseadas em múltiplos fatores"""
        for rec in recommendations:
            priority_score = self._calculate_priority_score(rec, context)
            rec['priority_score'] = priority_score
        
        # Ordenar por prioridade
        return sorted(recommendations, key=lambda x: x['priority_score'], reverse=True)
    
    def _calculate_priority_score(self, recommendation: Dict[str, Any], 
                                context: RecommendationContext) -> float:
        """Calcula score de prioridade"""
        urgency = self._calculate_urgency(recommendation, context)
        relevance = recommendation['relevance_score']
        user_preference = self._calculate_user_preference(recommendation, context)
        timing = self._calculate_timing_score(recommendation, context)
        
        priority_score = (
            urgency * self.priority_factors['urgency'] +
            relevance * self.priority_factors['relevance'] +
            user_preference * self.priority_factors['user_preference'] +
            timing * self.priority_factors['timing']
        )
        
        return priority_score
    
    def _calculate_urgency(self, recommendation: Dict[str, Any], 
                         context: RecommendationContext) -> float:
        """Calcula urgência da recomendação"""
        rec_type = recommendation['type']
        
        # Recomendações de recuperação são urgentes após treinos intensos
        if rec_type == RecommendationType.RECOVERY:
            if context.progress_history:
                last_workout = context.progress_history[-1]
                if last_workout.average_rpe > 8:
                    return 0.9
        
        # Recomendações de progressão são urgentes em caso de plateau
        if rec_type == RecommendationType.PROGRESSION:
            if context.current_trends['plateau_risk'] == 'high':
                return 0.8
        
        return 0.5  # Urgência média por padrão
    
    def _calculate_user_preference(self, recommendation: Dict[str, Any], 
                                 context: RecommendationContext) -> float:
        """Calcula preferência do usuário"""
        # Simulação - em produção, usaria histórico de feedback
        return 0.7
    
    def _calculate_timing_score(self, recommendation: Dict[str, Any], 
                              context: RecommendationContext) -> float:
        """Calcula score de timing"""
        # Simulação - em produção, consideraria horário do dia, dia da semana, etc.
        return 0.8
    
    def _personalize_content(self, recommendations: List[Dict[str, Any]], 
                           context: RecommendationContext) -> List[Dict[str, Any]]:
        """Personaliza conteúdo das recomendações"""
        personalized = []
        
        for rec in recommendations:
            # Personalizar título e descrição
            rec['title'] = self._personalize_title(rec['title'], context)
            rec['description'] = self._personalize_description(rec['description'], context)
            
            # Adicionar contexto específico
            rec['context_data'] = {
                'user_level': context.user.experience_level.value,
                'user_goal': context.user.fitness_goal.value,
                'current_trend': context.current_trends
            }
            
            personalized.append(rec)
        
        return personalized
    
    def _personalize_title(self, title: str, context: RecommendationContext) -> str:
        """Personaliza título da recomendação"""
        # Substituir placeholders
        title = title.replace('{user_name}', context.user.full_name.split()[0])
        title = title.replace('{user_level}', context.user.experience_level.value)
        title = title.replace('{user_goal}', context.user.fitness_goal.value)
        
        return title
    
    def _personalize_description(self, description: str, context: RecommendationContext) -> str:
        """Personaliza descrição da recomendação"""
        # Substituir placeholders
        description = description.replace('{user_name}', context.user.full_name.split()[0])
        description = description.replace('{user_level}', context.user.experience_level.value)
        description = description.replace('{user_goal}', context.user.fitness_goal.value)
        
        return description


class ExerciseRecommender:
    """Recomendador de exercícios"""
    
    def generate_recommendations(self, context: RecommendationContext) -> List[Dict[str, Any]]:
        """Gera recomendações de exercícios"""
        recommendations = []
        
        # Recomendações baseadas em gaps de treino
        muscle_gaps = self._identify_muscle_gaps(context)
        for gap in muscle_gaps:
            recommendations.append({
                'type': RecommendationType.EXERCISE,
                'title': f'Fortaleça seu {gap}',
                'description': f'Incluir mais exercícios para {gap} melhorará seu equilíbrio muscular',
                'content': {
                    'muscle_group': gap,
                    'suggested_exercises': self._get_exercises_for_muscle(gap),
                    'frequency': 'once_per_week'
                },
                'priority': 3,
                'relevance_score': 0.8
            })
        
        # Recomendações baseadas em objetivos
        goal_exercises = self._recommend_goal_specific_exercises(context)
        recommendations.extend(goal_exercises)
        
        # Recomendações baseadas em progressão
        progression_exercises = self._recommend_progression_exercises(context)
        recommendations.extend(progression_exercises)
        
        return recommendations
    
    def _identify_muscle_gaps(self, context: RecommendationContext) -> List[str]:
        """Identifica gaps em grupos musculares"""
        # Simulação - em produção, analisaria histórico de treinos
        return ['core', 'posterior']
    
    def _get_exercises_for_muscle(self, muscle_group: str) -> List[str]:
        """Retorna exercícios para grupo muscular"""
        exercises_map = {
            'core': ['Prancha', 'Abdominal', 'Russian Twist'],
            'posterior': ['Deadlift', 'Pull-up', 'Remada'],
            'legs': ['Agachamento', 'Lunges', 'Leg Press']
        }
        
        return exercises_map.get(muscle_group, [])
    
    def _recommend_goal_specific_exercises(self, context: RecommendationContext) -> List[Dict[str, Any]]:
        """Recomenda exercícios específicos para o objetivo"""
        recommendations = []
        
        if context.user.fitness_goal == FitnessGoal.WEIGHT_LOSS:
            recommendations.append({
                'type': RecommendationType.EXERCISE,
                'title': 'Adicione HIIT ao seu treino',
                'description': 'Exercícios HIIT são excelentes para queima de gordura',
                'content': {
                    'exercise_type': 'HIIT',
                    'duration': 20,
                    'frequency': '3x por semana'
                },
                'priority': 4,
                'relevance_score': 0.9
            })
        
        return recommendations
    
    def _recommend_progression_exercises(self, context: RecommendationContext) -> List[Dict[str, Any]]:
        """Recomenda exercícios para progressão"""
        recommendations = []
        
        if context.current_trends['plateau_risk'] == 'high':
            recommendations.append({
                'type': RecommendationType.EXERCISE,
                'title': 'Varie seus exercícios',
                'description': 'Novos exercícios podem quebrar o plateau atual',
                'content': {
                    'suggestion': 'new_exercises',
                    'focus': 'variation'
                },
                'priority': 4,
                'relevance_score': 0.8
            })
        
        return recommendations


class NutritionRecommender:
    """Recomendador de nutrição"""
    
    def generate_recommendations(self, context: RecommendationContext) -> List[Dict[str, Any]]:
        """Gera recomendações de nutrição"""
        recommendations = []
        
        # Recomendações baseadas no objetivo
        if context.user.fitness_goal == FitnessGoal.WEIGHT_LOSS:
            recommendations.append({
                'type': RecommendationType.NUTRITION,
                'title': 'Mantenha déficit calórico',
                'description': 'Para perda de peso, mantenha consumo calórico 300-500 cal abaixo do TDEE',
                'content': {
                    'caloric_deficit': 400,
                    'protein_target': context.user.weight * 1.2,
                    'meal_timing': 'regular'
                },
                'priority': 4,
                'relevance_score': 0.9
            })
        
        elif context.user.fitness_goal == FitnessGoal.MUSCLE_GAIN:
            recommendations.append({
                'type': RecommendationType.NUTRITION,
                'title': 'Aumente consumo proteico',
                'description': 'Para ganho muscular, consuma 1.6-2.2g de proteína por kg de peso corporal',
                'content': {
                    'protein_target': context.user.weight * 1.8,
                    'caloric_surplus': 300,
                    'meal_frequency': 4
                },
                'priority': 4,
                'relevance_score': 0.9
            })
        
        # Recomendações baseadas em timing
        recommendations.append({
            'type': RecommendationType.NUTRITION,
            'title': 'Nutrição pré-treino',
            'description': 'Consuma carboidratos 1-2 horas antes do treino para melhor performance',
            'content': {
                'timing': 'pre_workout',
                'macros': 'carbs_focused',
                'examples': ['Banana', 'Aveia', 'Batata doce']
            },
            'priority': 3,
            'relevance_score': 0.7
        })
        
        return recommendations


class RecoveryRecommender:
    """Recomendador de recuperação"""
    
    def generate_recommendations(self, context: RecommendationContext) -> List[Dict[str, Any]]:
        """Gera recomendações de recuperação"""
        recommendations = []
        
        # Recomendações baseadas na intensidade do último treino
        if context.progress_history:
            last_workout = context.progress_history[-1]
            
            if last_workout.average_rpe > 8:
                recommendations.append({
                    'type': RecommendationType.RECOVERY,
                    'title': 'Recuperação ativa necessária',
                    'description': 'Seu último treino foi intenso. Foque na recuperação.',
                    'content': {
                        'sleep_hours': 8,
                        'active_recovery': ['Caminhada leve', 'Alongamento'],
                        'hydration': '3-4 litros'
                    },
                    'priority': 5,
                    'relevance_score': 0.9
                })
        
        # Recomendações gerais de recuperação
        recommendations.append({
            'type': RecommendationType.RECOVERY,
            'title': 'Priorize o sono',
            'description': 'Sono de qualidade é fundamental para recuperação muscular',
            'content': {
                'sleep_hours': 7-9,
                'sleep_quality_tips': ['Ambiente escuro', 'Temperatura fresca', 'Sem telas 1h antes']
            },
            'priority': 3,
            'relevance_score': 0.8
        })
        
        return recommendations


class ProgressionRecommender:
    """Recomendador de progressão"""
    
    def generate_recommendations(self, context: RecommendationContext) -> List[Dict[str, Any]]:
        """Gera recomendações de progressão"""
        recommendations = []
        
        # Recomendações baseadas no plateau
        if context.current_trends['plateau_risk'] == 'high':
            recommendations.append({
                'type': RecommendationType.PROGRESSION,
                'title': 'Quebrar plateau atual',
                'description': 'Seu progresso estagnou. Hora de mudar a estratégia!',
                'content': {
                    'strategy': 'periodization',
                    'changes': ['Aumentar intensidade', 'Variar exercícios', 'Alterar rep ranges'],
                    'timeline': '2-3 semanas'
                },
                'priority': 5,
                'relevance_score': 0.95
            })
        
        # Recomendações baseadas no nível de experiência
        if context.user.experience_level == ExperienceLevel.BEGINNER:
            recommendations.append({
                'type': RecommendationType.PROGRESSION,
                'title': 'Progressão linear',
                'description': 'Como iniciante, foque em aumentar peso gradualmente',
                'content': {
                    'progression_type': 'linear',
                    'weight_increase': '2.5kg por semana',
                    'focus': 'technique_first'
                },
                'priority': 4,
                'relevance_score': 0.8
            })
        
        return recommendations


class MotivationRecommender:
    """Recomendador de motivação"""
    
    def generate_recommendations(self, context: RecommendationContext) -> List[Dict[str, Any]]:
        """Gera recomendações de motivação"""
        recommendations = []
        
        # Recomendações baseadas na consistência
        if context.current_trends['consistency_trend'] == 'declining':
            recommendations.append({
                'type': RecommendationType.MOTIVATION,
                'title': 'Melhore sua consistência',
                'description': 'Pequenos ajustes podem fazer grande diferença na constância',
                'content': {
                    'strategies': ['Definir horários fixos', 'Treinos mais curtos', 'Encontrar parceiro'],
                    'goal_setting': 'mini_goals'
                },
                'priority': 4,
                'relevance_score': 0.8
            })
        
        # Recomendações baseadas no progresso
        if context.current_trends['performance_trend'] == 'improving':
            recommendations.append({
                'type': RecommendationType.MOTIVATION,
                'title': 'Parabéns pelo progresso!',
                'description': 'Você está no caminho certo. Continue assim!',
                'content': {
                    'celebration': 'acknowledge_progress',
                    'next_milestone': 'set_new_goal'
                },
                'priority': 2,
                'relevance_score': 0.6
            })
        
        return recommendations


class PersonalizationEngine:
    """Sistema de personalização de recomendações"""
    
    def __init__(self):
        self.user_similarity_model = None
        self.content_similarity_model = None
        self._initialize_models()
    
    def _initialize_models(self):
        """Inicializa modelos de similaridade"""
        # Em produção, carregaria modelos treinados
        pass
    
    def get_similar_users(self, user: User, all_users: List[User]) -> List[User]:
        """Encontra usuários similares baseado em características"""
        similarities = []
        
        for other_user in all_users:
            if other_user.id == user.id:
                continue
            
            similarity = self._calculate_user_similarity(user, other_user)
            similarities.append((other_user, similarity))
        
        # Ordenar por similaridade
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        return [user for user, _ in similarities[:10]]
    
    def _calculate_user_similarity(self, user1: User, user2: User) -> float:
        """Calcula similaridade entre usuários"""
        # Fatores de similaridade
        age_similarity = 1 - abs(user1.age - user2.age) / 50
        weight_similarity = 1 - abs(user1.weight - user2.weight) / 100
        goal_similarity = 1 if user1.fitness_goal == user2.fitness_goal else 0
        experience_similarity = 1 if user1.experience_level == user2.experience_level else 0
        
        # Média ponderada
        similarity = (
            age_similarity * 0.2 +
            weight_similarity * 0.2 +
            goal_similarity * 0.4 +
            experience_similarity * 0.2
        )
        
        return similarity
    
    def collaborative_filtering_recommendations(self, user: User, 
                                              similar_users: List[User],
                                              all_recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Gera recomendações baseadas em filtro colaborativo"""
        # Simulação - em produção, usaria histórico de feedback
        return []


class RecommendationEvaluator:
    """Avaliador de qualidade das recomendações"""
    
    def __init__(self):
        self.feedback_history = []
        self.performance_metrics = {}
    
    def evaluate_recommendation_quality(self, recommendations: List[Dict[str, Any]], 
                                      context: RecommendationContext) -> Dict[str, Any]:
        """Avalia qualidade das recomendações"""
        metrics = {
            'diversity_score': self._calculate_diversity_score(recommendations),
            'relevance_score': self._calculate_avg_relevance(recommendations),
            'novelty_score': self._calculate_novelty_score(recommendations, context),
            'coverage_score': self._calculate_coverage_score(recommendations),
            'overall_quality': 0.0
        }
        
        # Calcular score geral
        metrics['overall_quality'] = (
            metrics['diversity_score'] * 0.25 +
            metrics['relevance_score'] * 0.4 +
            metrics['novelty_score'] * 0.2 +
            metrics['coverage_score'] * 0.15
        )
        
        return metrics
    
    def _calculate_diversity_score(self, recommendations: List[Dict[str, Any]]) -> float:
        """Calcula score de diversidade"""
        types = [rec['type'] for rec in recommendations]
        unique_types = set(types)
        
        return len(unique_types) / len(RecommendationType)
    
    def _calculate_avg_relevance(self, recommendations: List[Dict[str, Any]]) -> float:
        """Calcula relevância média"""
        if not recommendations:
            return 0.0
        
        total_relevance = sum(rec['relevance_score'] for rec in recommendations)
        return total_relevance / len(recommendations)
    
    def _calculate_novelty_score(self, recommendations: List[Dict[str, Any]], 
                               context: RecommendationContext) -> float:
        """Calcula score de novidade"""
        # Simulação - em produção, compararia com recomendações anteriores
        return 0.7
    
    def _calculate_coverage_score(self, recommendations: List[Dict[str, Any]]) -> float:
        """Calcula score de cobertura"""
        # Verifica se todas as categorias importantes estão cobertas
        covered_types = set(rec['type'] for rec in recommendations)
        important_types = {RecommendationType.EXERCISE, RecommendationType.NUTRITION, 
                          RecommendationType.RECOVERY, RecommendationType.PROGRESSION}
        
        coverage = len(covered_types.intersection(important_types)) / len(important_types)
        return coverage
    
    def update_feedback(self, recommendation_id: int, feedback: Dict[str, Any]):
        """Atualiza feedback sobre recomendação"""
        self.feedback_history.append({
            'recommendation_id': recommendation_id,
            'feedback': feedback,
            'timestamp': datetime.utcnow()
        })
        
        # Atualizar métricas de performance
        self._update_performance_metrics(feedback)
    
    def _update_performance_metrics(self, feedback: Dict[str, Any]):
        """Atualiza métricas de performance baseadas no feedback"""
        # Implementar learning online baseado no feedback
        pass