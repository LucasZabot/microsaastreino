const { Op } = require('sequelize');
const { User, Exercise, Workout, WorkoutExercise } = require('../models');
const { Matrix } = require('ml-matrix');

class AIRecommendationService {
  
  // Get workout recommendations for a user
  async getWorkoutRecommendations(userId, preferences = {}) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's workout history
      const userWorkouts = await this.getUserWorkoutHistory(userId);
      
      // Get user preferences and profile
      const userProfile = this.buildUserProfile(user, preferences);
      
      // Generate recommendations based on different strategies
      const recommendations = await this.generateRecommendations(userProfile, userWorkouts);
      
      return {
        success: true,
        data: {
          recommendations,
          profile: userProfile
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Generate exercise recommendations
  async getExerciseRecommendations(userId, workoutId = null, preferences = {}) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const userProfile = this.buildUserProfile(user, preferences);
      
      // Get exercises based on user level and preferences
      const exercises = await this.getRecommendedExercises(userProfile, workoutId);
      
      return {
        success: true,
        data: {
          exercises,
          profile: userProfile
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Build user profile for recommendations
  buildUserProfile(user, preferences = {}) {
    const profile = {
      fitness_level: user.fitness_level || 'beginner',
      goals: user.goals || [],
      injuries: user.injuries || [],
      preferred_duration: user.preferred_workout_duration || 60,
      preferred_days: user.preferred_workout_days || [1, 3, 5],
      height: user.height,
      weight: user.weight,
      age: user.birth_date ? this.calculateAge(user.birth_date) : null,
      gender: user.gender,
      is_premium: user.is_premium || false,
      ...preferences
    };

    return profile;
  }

  // Calculate age from birth date
  calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  // Get user's workout history
  async getUserWorkoutHistory(userId, limit = 50) {
    return await Workout.findAll({
      where: {
        user_id: userId,
        status: 'completed'
      },
      include: [
        {
          model: WorkoutExercise,
          as: 'workoutExercises',
          include: [
            {
              model: Exercise,
              as: 'exercise',
              attributes: ['name', 'category', 'muscle_groups', 'difficulty_level']
            }
          ]
        }
      ],
      order: [['completed_at', 'DESC']],
      limit
    });
  }

  // Generate workout recommendations
  async generateRecommendations(userProfile, userWorkouts) {
    const recommendations = [];

    // 1. Beginner-friendly recommendations
    if (userProfile.fitness_level === 'beginner') {
      recommendations.push(...await this.getBeginnerRecommendations(userProfile));
    }

    // 2. Goal-based recommendations
    if (userProfile.goals.length > 0) {
      recommendations.push(...await this.getGoalBasedRecommendations(userProfile));
    }

    // 3. Balanced muscle group recommendations
    recommendations.push(...await this.getBalancedMuscleGroupRecommendations(userProfile, userWorkouts));

    // 4. Progressive overload recommendations
    if (userWorkouts.length > 0) {
      recommendations.push(...await this.getProgressiveOverloadRecommendations(userProfile, userWorkouts));
    }

    // 5. Variety-based recommendations
    recommendations.push(...await this.getVarietyBasedRecommendations(userProfile, userWorkouts));

    // Remove duplicates and sort by score
    const uniqueRecommendations = this.removeDuplicatesAndScore(recommendations);

    return uniqueRecommendations.slice(0, 10); // Return top 10
  }

  // Get beginner recommendations
  async getBeginnerRecommendations(userProfile) {
    const exercises = await Exercise.findAll({
      where: {
        difficulty_level: 'beginner',
        is_active: true,
        is_premium: userProfile.is_premium ? undefined : false
      },
      limit: 20
    });

    return exercises.map(exercise => ({
      type: 'beginner_friendly',
      exercise,
      score: 0.8,
      reason: 'Perfect for beginners',
      suggested_sets: 2,
      suggested_reps: 10,
      suggested_weight: null
    }));
  }

  // Get goal-based recommendations
  async getGoalBasedRecommendations(userProfile) {
    const goalMap = {
      'weight_loss': {
        categories: ['cardio', 'strength'],
        muscle_groups: ['legs', 'core'],
        intensity: 'high'
      },
      'muscle_gain': {
        categories: ['strength', 'powerlifting'],
        muscle_groups: ['chest', 'back', 'legs'],
        intensity: 'high'
      },
      'strength': {
        categories: ['strength', 'powerlifting'],
        muscle_groups: ['chest', 'back', 'legs', 'shoulders'],
        intensity: 'high'
      },
      'endurance': {
        categories: ['cardio', 'sports'],
        muscle_groups: ['legs', 'core'],
        intensity: 'moderate'
      },
      'flexibility': {
        categories: ['stretching', 'flexibility'],
        muscle_groups: ['back', 'legs', 'shoulders'],
        intensity: 'low'
      }
    };

    const recommendations = [];

    for (const goal of userProfile.goals) {
      const goalConfig = goalMap[goal];
      if (!goalConfig) continue;

      const exercises = await Exercise.findAll({
        where: {
          category: { [Op.in]: goalConfig.categories },
          is_active: true,
          is_premium: userProfile.is_premium ? undefined : false
        },
        limit: 10
      });

      exercises.forEach(exercise => {
        recommendations.push({
          type: 'goal_based',
          exercise,
          score: 0.9,
          reason: `Great for ${goal}`,
          suggested_sets: this.getSuggestedSets(goalConfig.intensity, userProfile.fitness_level),
          suggested_reps: this.getSuggestedReps(goalConfig.intensity, userProfile.fitness_level),
          suggested_weight: null
        });
      });
    }

    return recommendations;
  }

  // Get balanced muscle group recommendations
  async getBalancedMuscleGroupRecommendations(userProfile, userWorkouts) {
    const muscleGroupFrequency = this.analyzeMuscleGroupFrequency(userWorkouts);
    const underworkedMuscles = this.getUnderworkedMuscleGroups(muscleGroupFrequency);

    const recommendations = [];

    for (const muscleGroup of underworkedMuscles) {
      const exercises = await Exercise.findAll({
        where: {
          primary_muscles: { [Op.overlap]: [muscleGroup] },
          difficulty_level: userProfile.fitness_level,
          is_active: true,
          is_premium: userProfile.is_premium ? undefined : false
        },
        limit: 5
      });

      exercises.forEach(exercise => {
        recommendations.push({
          type: 'muscle_balance',
          exercise,
          score: 0.85,
          reason: `Balance your ${muscleGroup} training`,
          suggested_sets: this.getSuggestedSets('moderate', userProfile.fitness_level),
          suggested_reps: this.getSuggestedReps('moderate', userProfile.fitness_level),
          suggested_weight: null
        });
      });
    }

    return recommendations;
  }

  // Get progressive overload recommendations
  async getProgressiveOverloadRecommendations(userProfile, userWorkouts) {
    const recommendations = [];
    const recentWorkouts = userWorkouts.slice(0, 10);

    for (const workout of recentWorkouts) {
      for (const workoutExercise of workout.workoutExercises) {
        if (workoutExercise.actual_weight && workoutExercise.actual_reps) {
          const progressiveRecommendation = this.calculateProgressiveOverload(
            workoutExercise,
            userProfile.fitness_level
          );

          if (progressiveRecommendation) {
            recommendations.push({
              type: 'progressive_overload',
              exercise: workoutExercise.exercise,
              score: 0.95,
              reason: 'Progressive overload progression',
              suggested_sets: progressiveRecommendation.sets,
              suggested_reps: progressiveRecommendation.reps,
              suggested_weight: progressiveRecommendation.weight
            });
          }
        }
      }
    }

    return recommendations;
  }

  // Get variety-based recommendations
  async getVarietyBasedRecommendations(userProfile, userWorkouts) {
    const recentExerciseIds = userWorkouts
      .flatMap(workout => workout.workoutExercises)
      .map(we => we.exercise_id);

    const newExercises = await Exercise.findAll({
      where: {
        id: { [Op.notIn]: recentExerciseIds },
        difficulty_level: userProfile.fitness_level,
        is_active: true,
        is_premium: userProfile.is_premium ? undefined : false
      },
      limit: 15
    });

    return newExercises.map(exercise => ({
      type: 'variety',
      exercise,
      score: 0.7,
      reason: 'Try something new',
      suggested_sets: this.getSuggestedSets('moderate', userProfile.fitness_level),
      suggested_reps: this.getSuggestedReps('moderate', userProfile.fitness_level),
      suggested_weight: null
    }));
  }

  // Analyze muscle group frequency
  analyzeMuscleGroupFrequency(userWorkouts) {
    const frequency = {};
    const allMuscleGroups = [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 
      'glutes', 'core', 'calves', 'forearms'
    ];

    // Initialize frequency map
    allMuscleGroups.forEach(group => frequency[group] = 0);

    // Count muscle group usage
    userWorkouts.forEach(workout => {
      workout.workoutExercises.forEach(we => {
        if (we.exercise && we.exercise.muscle_groups) {
          we.exercise.muscle_groups.forEach(group => {
            if (frequency[group] !== undefined) {
              frequency[group]++;
            }
          });
        }
      });
    });

    return frequency;
  }

  // Get underworked muscle groups
  getUnderworkedMuscleGroups(frequency) {
    const sorted = Object.entries(frequency).sort((a, b) => a[1] - b[1]);
    return sorted.slice(0, 3).map(([group]) => group);
  }

  // Calculate progressive overload
  calculateProgressiveOverload(workoutExercise, fitnessLevel) {
    const progressionRates = {
      beginner: { weight: 0.05, reps: 1, sets: 0 },
      intermediate: { weight: 0.025, reps: 0.5, sets: 0 },
      advanced: { weight: 0.0125, reps: 0.25, sets: 0 }
    };

    const progression = progressionRates[fitnessLevel];
    
    return {
      sets: workoutExercise.actual_sets,
      reps: Math.ceil(workoutExercise.actual_reps * (1 + progression.reps / 10)),
      weight: Math.ceil(workoutExercise.actual_weight * (1 + progression.weight))
    };
  }

  // Get suggested sets based on intensity and fitness level
  getSuggestedSets(intensity, fitnessLevel) {
    const setMap = {
      beginner: { low: 2, moderate: 3, high: 3 },
      intermediate: { low: 2, moderate: 3, high: 4 },
      advanced: { low: 3, moderate: 4, high: 5 }
    };

    return setMap[fitnessLevel][intensity];
  }

  // Get suggested reps based on intensity and fitness level
  getSuggestedReps(intensity, fitnessLevel) {
    const repMap = {
      beginner: { low: 8, moderate: 10, high: 12 },
      intermediate: { low: 10, moderate: 12, high: 15 },
      advanced: { low: 12, moderate: 15, high: 20 }
    };

    return repMap[fitnessLevel][intensity];
  }

  // Get recommended exercises for a specific workout
  async getRecommendedExercises(userProfile, workoutId) {
    let targetMuscleGroups = [];
    let workoutCategory = null;

    if (workoutId) {
      const workout = await Workout.findByPk(workoutId);
      if (workout) {
        targetMuscleGroups = workout.muscle_groups || [];
        workoutCategory = workout.category;
      }
    }

    const where = {
      is_active: true,
      is_premium: userProfile.is_premium ? undefined : false
    };

    if (userProfile.fitness_level) {
      where.difficulty_level = userProfile.fitness_level;
    }

    if (workoutCategory) {
      where.category = workoutCategory;
    }

    if (targetMuscleGroups.length > 0) {
      where.muscle_groups = { [Op.overlap]: targetMuscleGroups };
    }

    const exercises = await Exercise.findAll({
      where,
      limit: 20,
      order: [['name', 'ASC']]
    });

    return exercises.map(exercise => ({
      exercise,
      score: this.calculateExerciseScore(exercise, userProfile),
      reason: this.getExerciseRecommendationReason(exercise, userProfile),
      suggested_sets: this.getSuggestedSets('moderate', userProfile.fitness_level),
      suggested_reps: this.getSuggestedReps('moderate', userProfile.fitness_level)
    }));
  }

  // Calculate exercise score
  calculateExerciseScore(exercise, userProfile) {
    let score = 0.5;

    // Fitness level match
    if (exercise.difficulty_level === userProfile.fitness_level) {
      score += 0.3;
    }

    // Goal alignment
    if (userProfile.goals.includes('strength') && exercise.category === 'strength') {
      score += 0.2;
    }

    // Injury considerations
    if (userProfile.injuries.length > 0) {
      // Reduce score for potentially problematic exercises
      if (userProfile.injuries.includes('back') && exercise.muscle_groups.includes('back')) {
        score -= 0.1;
      }
    }

    return Math.min(1, Math.max(0, score));
  }

  // Get exercise recommendation reason
  getExerciseRecommendationReason(exercise, userProfile) {
    const reasons = [];

    if (exercise.difficulty_level === userProfile.fitness_level) {
      reasons.push(`Perfect for ${userProfile.fitness_level} level`);
    }

    if (userProfile.goals.includes('strength') && exercise.category === 'strength') {
      reasons.push('Great for strength building');
    }

    if (exercise.mechanics === 'compound') {
      reasons.push('Compound movement for multiple muscles');
    }

    return reasons.join(', ') || 'Good exercise choice';
  }

  // Remove duplicates and score recommendations
  removeDuplicatesAndScore(recommendations) {
    const seen = new Set();
    const unique = [];

    for (const rec of recommendations) {
      const key = `${rec.exercise.id}-${rec.type}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(rec);
      }
    }

    return unique.sort((a, b) => b.score - a.score);
  }

  // Generate a complete workout plan
  async generateWorkoutPlan(userId, duration = 7, preferences = {}) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const userProfile = this.buildUserProfile(user, preferences);
      const userWorkouts = await this.getUserWorkoutHistory(userId);

      const workoutPlan = [];
      const daysPerWeek = userProfile.preferred_days.length;
      const totalDays = Math.min(duration, daysPerWeek * Math.ceil(duration / 7));

      for (let day = 0; day < totalDays; day++) {
        const dayWorkout = await this.generateDayWorkout(userProfile, userWorkouts, day);
        workoutPlan.push(dayWorkout);
      }

      return {
        success: true,
        data: {
          workout_plan: workoutPlan,
          duration,
          user_profile: userProfile
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Generate workout for a specific day
  async generateDayWorkout(userProfile, userWorkouts, dayIndex) {
    const workoutTypes = ['upper_body', 'lower_body', 'full_body', 'cardio'];
    const workoutType = workoutTypes[dayIndex % workoutTypes.length];

    const recommendations = await this.getWorkoutRecommendations(userProfile.user_id, {
      category: workoutType,
      duration: userProfile.preferred_duration
    });

    return {
      day: dayIndex + 1,
      type: workoutType,
      duration: userProfile.preferred_duration,
      exercises: recommendations.data.recommendations.slice(0, 6)
    };
  }
}

module.exports = new AIRecommendationService();