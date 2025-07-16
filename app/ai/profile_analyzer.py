import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestRegressor
from typing import Dict, List, Any, Tuple
import json
from datetime import datetime, timedelta
from app.models.user import User, ExperienceLevel, FitnessGoal
from app.models.workout import ProgressRecord
from app.models.recommendation import UserMetrics

class UserProfileAnalyzer:
    """
    Classe responsável por analisar o perfil do usuário usando algoritmos de IA
    para determinar características, limitações e potencial de progresso.
    """
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.fitness_clusters = None
        self.progress_predictor = None
        self._load_models()
    
    def _load_models(self):
        """Carrega ou inicializa os modelos de IA"""
        # Em produção, estes modelos seriam carregados do banco de dados
        # Por enquanto, inicializamos com valores padrão
        self.fitness_clusters = KMeans(n_clusters=5, random_state=42)
        self.progress_predictor = RandomForestRegressor(n_estimators=100, random_state=42)
    
    def analyze_user_profile(self, user: User, progress_history: List[ProgressRecord] = None) -> Dict[str, Any]:
        """
        Analisa o perfil completo do usuário e retorna insights detalhados
        """
        analysis = {
            'user_id': user.id,
            'physical_analysis': self._analyze_physical_metrics(user),
            'fitness_level': self._assess_fitness_level(user, progress_history),
            'goal_analysis': self._analyze_goals(user),
            'limitations': self._identify_limitations(user),
            'recommendations': self._generate_profile_recommendations(user),
            'user_cluster': self._classify_user_type(user),
            'progress_potential': self._predict_progress_potential(user, progress_history),
            'analysis_timestamp': datetime.utcnow().isoformat()
        }
        
        return analysis
    
    def _analyze_physical_metrics(self, user: User) -> Dict[str, Any]:
        """Analisa métricas físicas do usuário"""
        # Calcular BMI
        bmi = user.weight / ((user.height / 100) ** 2)
        
        # Calcular BMR usando fórmula de Mifflin-St Jeor
        if user.gender.lower() == 'male':
            bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5
        else:
            bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161
        
        # Calcular TDEE baseado no nível de atividade
        activity_multipliers = {
            ExperienceLevel.BEGINNER: 1.2,
            ExperienceLevel.INTERMEDIATE: 1.55,
            ExperienceLevel.ADVANCED: 1.725
        }
        
        tdee = bmr * activity_multipliers.get(user.experience_level, 1.2)
        
        # Classificar composição corporal
        body_composition = self._classify_body_composition(user, bmi)
        
        return {
            'bmi': round(bmi, 2),
            'bmr': round(bmr, 2),
            'tdee': round(tdee, 2),
            'body_composition': body_composition,
            'health_risk_factors': self._assess_health_risks(user, bmi),
            'optimal_weight_range': self._calculate_optimal_weight_range(user),
        }
    
    def _assess_fitness_level(self, user: User, progress_history: List[ProgressRecord]) -> Dict[str, Any]:
        """Avalia o nível de fitness baseado no histórico e perfil"""
        base_score = {
            ExperienceLevel.BEGINNER: 30,
            ExperienceLevel.INTERMEDIATE: 60,
            ExperienceLevel.ADVANCED: 85
        }.get(user.experience_level, 30)
        
        # Ajustar baseado no histórico de progresso
        if progress_history:
            recent_progress = [p for p in progress_history 
                             if p.recorded_at > datetime.utcnow() - timedelta(days=30)]
            
            if recent_progress:
                avg_completion = np.mean([p.completion_percentage for p in recent_progress])
                avg_satisfaction = np.mean([p.satisfaction_rating for p in recent_progress])
                consistency = len(recent_progress) / 30  # treinos por dia
                
                # Ajustar score baseado na performance
                performance_adjustment = (avg_completion - 80) * 0.2 + (avg_satisfaction - 3) * 5
                consistency_adjustment = min(consistency * 20, 10)
                
                base_score += performance_adjustment + consistency_adjustment
        
        fitness_level = max(0, min(100, base_score))
        
        return {
            'overall_score': round(fitness_level, 1),
            'strength_level': self._estimate_strength_level(user, fitness_level),
            'endurance_level': self._estimate_endurance_level(user, fitness_level),
            'flexibility_level': self._estimate_flexibility_level(user, fitness_level),
            'consistency_score': self._calculate_consistency_score(progress_history),
            'improvement_areas': self._identify_improvement_areas(user, progress_history)
        }
    
    def _analyze_goals(self, user: User) -> Dict[str, Any]:
        """Analisa os objetivos do usuário e sua viabilidade"""
        goal_analysis = {
            'primary_goal': user.fitness_goal.value,
            'goal_difficulty': self._assess_goal_difficulty(user),
            'estimated_timeline': self._estimate_timeline(user),
            'success_probability': self._calculate_success_probability(user),
            'key_metrics': self._identify_key_metrics(user.fitness_goal),
            'milestone_suggestions': self._generate_milestone_suggestions(user)
        }
        
        return goal_analysis
    
    def _identify_limitations(self, user: User) -> List[Dict[str, Any]]:
        """Identifica limitações e restrições do usuário"""
        limitations = []
        
        # Limitações de tempo
        if user.available_days < 3:
            limitations.append({
                'type': 'time_constraint',
                'severity': 'medium',
                'description': 'Poucos dias disponíveis por semana',
                'recommendations': ['Treinos mais intensos', 'Exercícios compostos']
            })
        
        if user.session_duration < 30:
            limitations.append({
                'type': 'time_constraint',
                'severity': 'medium',
                'description': 'Sessões muito curtas',
                'recommendations': ['HIIT', 'Circuitos', 'Supersets']
            })
        
        # Limitações físicas baseadas em lesões
        if user.injuries:
            injuries = json.loads(user.injuries) if isinstance(user.injuries, str) else user.injuries
            for injury in injuries:
                limitations.append({
                    'type': 'physical_limitation',
                    'severity': 'high',
                    'description': f'Lesão: {injury}',
                    'recommendations': ['Exercícios adaptados', 'Fortalecimento preventivo']
                })
        
        # Limitações de experiência
        if user.experience_level == ExperienceLevel.BEGINNER:
            limitations.append({
                'type': 'experience_limitation',
                'severity': 'low',
                'description': 'Iniciante - necessita aprendizado de técnicas',
                'recommendations': ['Foco em forma', 'Progressão gradual', 'Exercícios básicos']
            })
        
        return limitations
    
    def _generate_profile_recommendations(self, user: User) -> List[str]:
        """Gera recomendações personalizadas baseadas no perfil"""
        recommendations = []
        
        # Recomendações baseadas no objetivo
        if user.fitness_goal == FitnessGoal.WEIGHT_LOSS:
            recommendations.extend([
                'Combinar treino de força com cardio',
                'Manter déficit calórico controlado',
                'Priorizar exercícios compostos'
            ])
        elif user.fitness_goal == FitnessGoal.MUSCLE_GAIN:
            recommendations.extend([
                'Focar em treinos de força',
                'Garantir superávit calórico',
                'Priorizar recuperação adequada'
            ])
        
        # Recomendações baseadas no nível de experiência
        if user.experience_level == ExperienceLevel.BEGINNER:
            recommendations.extend([
                'Começar com pesos leves',
                'Aprender técnica correta',
                'Progredir gradualmente'
            ])
        
        return recommendations
    
    def _classify_user_type(self, user: User) -> Dict[str, Any]:
        """Classifica o tipo de usuário usando clustering"""
        # Preparar features para clustering
        features = [
            user.age,
            user.weight,
            user.height,
            user.available_days,
            user.session_duration,
            user.experience_level.value.__hash__() % 100,
            user.fitness_goal.value.__hash__() % 100
        ]
        
        # Normalizar features
        features_normalized = self.scaler.fit_transform([features])
        
        # Classificar usuário (simulado - em produção usaria modelo treinado)
        user_types = [
            'Iniciante Dedicado',
            'Atleta Recreativo',
            'Entusiasta de Fitness',
            'Profissional Ocupado',
            'Atleta Avançado'
        ]
        
        # Lógica simplificada de classificação
        if user.experience_level == ExperienceLevel.BEGINNER:
            user_type = 'Iniciante Dedicado'
        elif user.available_days >= 5 and user.session_duration >= 60:
            user_type = 'Entusiasta de Fitness'
        elif user.available_days <= 3 and user.session_duration <= 45:
            user_type = 'Profissional Ocupado'
        else:
            user_type = 'Atleta Recreativo'
        
        return {
            'type': user_type,
            'confidence': 0.85,
            'characteristics': self._get_user_type_characteristics(user_type)
        }
    
    def _predict_progress_potential(self, user: User, progress_history: List[ProgressRecord]) -> Dict[str, Any]:
        """Prediz o potencial de progresso do usuário"""
        # Fatores que influenciam o progresso
        age_factor = max(0.5, 1 - (user.age - 25) * 0.01)
        experience_factor = {
            ExperienceLevel.BEGINNER: 0.8,
            ExperienceLevel.INTERMEDIATE: 0.6,
            ExperienceLevel.ADVANCED: 0.4
        }.get(user.experience_level, 0.6)
        
        consistency_factor = 1.0
        if progress_history:
            recent_sessions = len([p for p in progress_history 
                                 if p.recorded_at > datetime.utcnow() - timedelta(days=30)])
            consistency_factor = min(1.0, recent_sessions / (user.available_days * 4))
        
        # Calcular potencial geral
        overall_potential = (age_factor * 0.3 + experience_factor * 0.4 + consistency_factor * 0.3) * 100
        
        return {
            'overall_potential': round(overall_potential, 1),
            'strength_potential': round(overall_potential * 0.9, 1),
            'endurance_potential': round(overall_potential * 1.1, 1),
            'flexibility_potential': round(overall_potential * 0.8, 1),
            'factors': {
                'age_factor': round(age_factor, 2),
                'experience_factor': round(experience_factor, 2),
                'consistency_factor': round(consistency_factor, 2)
            },
            'timeline_prediction': self._predict_timeline(user, overall_potential)
        }
    
    def _classify_body_composition(self, user: User, bmi: float) -> Dict[str, Any]:
        """Classifica composição corporal"""
        if bmi < 18.5:
            category = 'Abaixo do peso'
        elif bmi < 25:
            category = 'Peso normal'
        elif bmi < 30:
            category = 'Sobrepeso'
        else:
            category = 'Obesidade'
        
        return {
            'category': category,
            'bmi': bmi,
            'body_fat_percentage': user.body_fat_percentage,
            'muscle_mass_estimate': self._estimate_muscle_mass(user)
        }
    
    def _assess_health_risks(self, user: User, bmi: float) -> List[str]:
        """Avalia riscos de saúde baseados no perfil"""
        risks = []
        
        if bmi >= 30:
            risks.append('Risco elevado de doenças cardiovasculares')
        if user.age > 40 and user.experience_level == ExperienceLevel.BEGINNER:
            risks.append('Necessidade de avaliação médica prévia')
        if user.body_fat_percentage and user.body_fat_percentage > 25 and user.gender.lower() == 'male':
            risks.append('Percentual de gordura elevado')
        
        return risks
    
    def _calculate_optimal_weight_range(self, user: User) -> Dict[str, float]:
        """Calcula faixa de peso ideal"""
        height_m = user.height / 100
        min_weight = 18.5 * (height_m ** 2)
        max_weight = 24.9 * (height_m ** 2)
        
        return {
            'min_weight': round(min_weight, 1),
            'max_weight': round(max_weight, 1),
            'current_weight': user.weight,
            'target_weight': self._calculate_target_weight(user)
        }
    
    def _calculate_target_weight(self, user: User) -> float:
        """Calcula peso alvo baseado no objetivo"""
        if user.fitness_goal == FitnessGoal.WEIGHT_LOSS:
            return user.weight * 0.85  # 15% de redução
        elif user.fitness_goal == FitnessGoal.MUSCLE_GAIN:
            return user.weight * 1.1   # 10% de aumento
        else:
            return user.weight  # Manter peso atual
    
    def _estimate_strength_level(self, user: User, fitness_level: float) -> float:
        """Estima nível de força"""
        base_strength = fitness_level * 0.8
        if user.fitness_goal == FitnessGoal.STRENGTH:
            base_strength *= 1.2
        return min(100, base_strength)
    
    def _estimate_endurance_level(self, user: User, fitness_level: float) -> float:
        """Estima nível de resistência"""
        base_endurance = fitness_level * 0.9
        if user.fitness_goal == FitnessGoal.ENDURANCE:
            base_endurance *= 1.3
        return min(100, base_endurance)
    
    def _estimate_flexibility_level(self, user: User, fitness_level: float) -> float:
        """Estima nível de flexibilidade"""
        base_flexibility = fitness_level * 0.6
        if user.age > 40:
            base_flexibility *= 0.8
        return min(100, base_flexibility)
    
    def _calculate_consistency_score(self, progress_history: List[ProgressRecord]) -> float:
        """Calcula score de consistência"""
        if not progress_history:
            return 0.0
        
        # Calcular treinos nos últimos 30 dias
        recent_workouts = [p for p in progress_history 
                          if p.recorded_at > datetime.utcnow() - timedelta(days=30)]
        
        return min(100, len(recent_workouts) * 2.5)  # Assumindo 12 treinos/mês como ideal
    
    def _identify_improvement_areas(self, user: User, progress_history: List[ProgressRecord]) -> List[str]:
        """Identifica áreas que precisam de melhoria"""
        areas = []
        
        if progress_history:
            avg_completion = np.mean([p.completion_percentage for p in progress_history])
            avg_satisfaction = np.mean([p.satisfaction_rating for p in progress_history])
            
            if avg_completion < 70:
                areas.append('Conclusão de treinos')
            if avg_satisfaction < 3:
                areas.append('Satisfação com treinos')
        
        if user.available_days < 3:
            areas.append('Frequência de treinos')
        
        return areas
    
    def _assess_goal_difficulty(self, user: User) -> str:
        """Avalia dificuldade do objetivo"""
        difficulty_map = {
            FitnessGoal.GENERAL_FITNESS: 'Baixa',
            FitnessGoal.WEIGHT_LOSS: 'Média',
            FitnessGoal.ENDURANCE: 'Média',
            FitnessGoal.MUSCLE_GAIN: 'Alta',
            FitnessGoal.STRENGTH: 'Alta'
        }
        return difficulty_map.get(user.fitness_goal, 'Média')
    
    def _estimate_timeline(self, user: User) -> str:
        """Estima timeline para atingir objetivo"""
        timeline_map = {
            FitnessGoal.GENERAL_FITNESS: '2-3 meses',
            FitnessGoal.WEIGHT_LOSS: '3-6 meses',
            FitnessGoal.ENDURANCE: '3-4 meses',
            FitnessGoal.MUSCLE_GAIN: '6-12 meses',
            FitnessGoal.STRENGTH: '4-8 meses'
        }
        return timeline_map.get(user.fitness_goal, '3-6 meses')
    
    def _calculate_success_probability(self, user: User) -> float:
        """Calcula probabilidade de sucesso"""
        base_probability = 0.7
        
        # Ajustar baseado em fatores
        if user.experience_level != ExperienceLevel.BEGINNER:
            base_probability += 0.1
        if user.available_days >= 4:
            base_probability += 0.1
        if user.session_duration >= 45:
            base_probability += 0.05
        
        return min(0.95, base_probability)
    
    def _identify_key_metrics(self, goal: FitnessGoal) -> List[str]:
        """Identifica métricas-chave para o objetivo"""
        metrics_map = {
            FitnessGoal.WEIGHT_LOSS: ['Peso corporal', 'Percentual de gordura', 'Circunferências'],
            FitnessGoal.MUSCLE_GAIN: ['Peso corporal', 'Massa muscular', 'Força'],
            FitnessGoal.STRENGTH: ['1RM', 'Volume de treino', 'Força relativa'],
            FitnessGoal.ENDURANCE: ['VO2 máx', 'Frequência cardíaca', 'Tempo de exercício'],
            FitnessGoal.GENERAL_FITNESS: ['Composição corporal', 'Força', 'Resistência']
        }
        return metrics_map.get(goal, ['Peso corporal', 'Força', 'Resistência'])
    
    def _generate_milestone_suggestions(self, user: User) -> List[str]:
        """Gera sugestões de marcos/metas"""
        milestones = []
        
        if user.fitness_goal == FitnessGoal.WEIGHT_LOSS:
            milestones = [
                'Perder 2% do peso corporal em 4 semanas',
                'Completar 12 treinos no primeiro mês',
                'Aumentar duração do cardio em 25%'
            ]
        elif user.fitness_goal == FitnessGoal.MUSCLE_GAIN:
            milestones = [
                'Aumentar peso dos exercícios principais em 10%',
                'Ganhar 1-2kg de massa muscular em 2 meses',
                'Completar 16 treinos de força no mês'
            ]
        
        return milestones
    
    def _get_user_type_characteristics(self, user_type: str) -> List[str]:
        """Retorna características do tipo de usuário"""
        characteristics_map = {
            'Iniciante Dedicado': ['Motivado', 'Precisa de orientação', 'Progressão rápida'],
            'Atleta Recreativo': ['Equilibrado', 'Consistente', 'Objetivos realistas'],
            'Entusiasta de Fitness': ['Experiente', 'Dedicado', 'Busca desafios'],
            'Profissional Ocupado': ['Limitado no tempo', 'Eficiente', 'Pragmático'],
            'Atleta Avançado': ['Experiente', 'Técnico', 'Objetivos específicos']
        }
        return characteristics_map.get(user_type, ['Características não definidas'])
    
    def _predict_timeline(self, user: User, potential: float) -> Dict[str, str]:
        """Prediz timeline de progresso"""
        multiplier = 1.0 if potential > 70 else 1.5
        
        return {
            'noticeable_changes': f'{int(2 * multiplier)}-{int(3 * multiplier)} semanas',
            'significant_progress': f'{int(6 * multiplier)}-{int(8 * multiplier)} semanas',
            'goal_achievement': f'{int(12 * multiplier)}-{int(16 * multiplier)} semanas'
        }
    
    def _estimate_muscle_mass(self, user: User) -> float:
        """Estima massa muscular"""
        if user.gender.lower() == 'male':
            muscle_mass = user.weight * 0.42
        else:
            muscle_mass = user.weight * 0.36
        
        return round(muscle_mass, 1)