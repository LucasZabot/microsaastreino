const aiRecommendationService = require('../services/aiRecommendationService');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get workout recommendations
// @route   GET /api/ai/recommendations/workouts
// @access  Private
const getWorkoutRecommendations = asyncHandler(async (req, res) => {
  const preferences = {
    category: req.query.category,
    duration: parseInt(req.query.duration) || undefined,
    difficulty_level: req.query.difficulty_level,
    muscle_groups: req.query.muscle_groups?.split(','),
    equipment: req.query.equipment?.split(',')
  };

  const result = await aiRecommendationService.getWorkoutRecommendations(
    req.user.id,
    preferences
  );

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message
    });
  }

  res.json({
    success: true,
    data: result.data
  });
});

// @desc    Get exercise recommendations
// @route   GET /api/ai/recommendations/exercises
// @access  Private
const getExerciseRecommendations = asyncHandler(async (req, res) => {
  const preferences = {
    category: req.query.category,
    difficulty_level: req.query.difficulty_level,
    muscle_groups: req.query.muscle_groups?.split(','),
    equipment: req.query.equipment?.split(',')
  };

  const result = await aiRecommendationService.getExerciseRecommendations(
    req.user.id,
    req.query.workout_id,
    preferences
  );

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message
    });
  }

  res.json({
    success: true,
    data: result.data
  });
});

// @desc    Generate workout plan
// @route   POST /api/ai/generate-plan
// @access  Private
const generateWorkoutPlan = asyncHandler(async (req, res) => {
  const {
    duration = 7,
    goals,
    difficulty_level,
    preferred_duration,
    preferred_days,
    equipment_available
  } = req.body;

  const preferences = {
    goals,
    difficulty_level,
    preferred_duration,
    preferred_days,
    equipment_available
  };

  const result = await aiRecommendationService.generateWorkoutPlan(
    req.user.id,
    duration,
    preferences
  );

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message
    });
  }

  res.json({
    success: true,
    message: 'Workout plan generated successfully',
    data: result.data
  });
});

// @desc    Get personalized workout
// @route   POST /api/ai/personalized-workout
// @access  Private
const getPersonalizedWorkout = asyncHandler(async (req, res) => {
  const {
    focus_areas,
    duration,
    equipment_available,
    avoid_exercises,
    intensity_level
  } = req.body;

  const preferences = {
    muscle_groups: focus_areas,
    duration: duration || req.user.preferred_workout_duration,
    equipment: equipment_available,
    avoid_exercises,
    intensity_level
  };

  const result = await aiRecommendationService.getWorkoutRecommendations(
    req.user.id,
    preferences
  );

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message
    });
  }

  // Transform recommendations into a structured workout
  const personalizedWorkout = {
    name: `Personalized Workout - ${new Date().toLocaleDateString()}`,
    duration: duration || req.user.preferred_workout_duration,
    focus_areas: focus_areas || [],
    exercises: result.data.recommendations.map((rec, index) => ({
      order: index + 1,
      exercise: rec.exercise,
      sets: rec.suggested_sets,
      reps: rec.suggested_reps,
      weight: rec.suggested_weight,
      rest_time: rec.exercise.rest_time_seconds,
      notes: rec.reason
    }))
  };

  res.json({
    success: true,
    message: 'Personalized workout generated successfully',
    data: {
      workout: personalizedWorkout,
      user_profile: result.data.profile
    }
  });
});

// @desc    Get progressive training suggestion
// @route   GET /api/ai/progressive-training
// @access  Private
const getProgressiveTraining = asyncHandler(async (req, res) => {
  const { exercise_id, current_weight, current_reps, current_sets } = req.query;

  if (!exercise_id || !current_weight || !current_reps) {
    return res.status(400).json({
      success: false,
      message: 'Exercise ID, current weight, and current reps are required'
    });
  }

  // Simulate progressive overload calculation
  const progressiveSuggestion = {
    exercise_id,
    current: {
      weight: parseFloat(current_weight),
      reps: parseInt(current_reps),
      sets: parseInt(current_sets) || 3
    },
    suggested: {
      weight: Math.ceil(parseFloat(current_weight) * 1.025), // 2.5% increase
      reps: parseInt(current_reps),
      sets: parseInt(current_sets) || 3
    },
    alternative: {
      weight: parseFloat(current_weight),
      reps: parseInt(current_reps) + 1,
      sets: parseInt(current_sets) || 3
    },
    notes: 'Progressive overload suggestion based on your fitness level'
  };

  // Adjust based on user's fitness level
  const fitnessLevel = req.user.fitness_level;
  if (fitnessLevel === 'beginner') {
    progressiveSuggestion.suggested.weight = Math.ceil(parseFloat(current_weight) * 1.05);
  } else if (fitnessLevel === 'advanced') {
    progressiveSuggestion.suggested.weight = Math.ceil(parseFloat(current_weight) * 1.0125);
  }

  res.json({
    success: true,
    data: {
      progressive_suggestion: progressiveSuggestion
    }
  });
});

// @desc    Get muscle balance analysis
// @route   GET /api/ai/muscle-balance
// @access  Private
const getMuscleBalanceAnalysis = asyncHandler(async (req, res) => {
  const { period = 30 } = req.query;

  const result = await aiRecommendationService.getWorkoutRecommendations(
    req.user.id,
    { analysis_period: period }
  );

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message
    });
  }

  // Filter for muscle balance recommendations
  const muscleBalanceRecs = result.data.recommendations.filter(
    rec => rec.type === 'muscle_balance'
  );

  const analysis = {
    period_days: parseInt(period),
    underworked_muscles: muscleBalanceRecs.map(rec => ({
      muscle_group: rec.exercise.primary_muscles[0],
      recommendation: rec.reason,
      suggested_exercises: [rec.exercise]
    })),
    recommendations: muscleBalanceRecs,
    overall_balance_score: Math.max(0, 100 - (muscleBalanceRecs.length * 10))
  };

  res.json({
    success: true,
    data: {
      muscle_balance_analysis: analysis
    }
  });
});

// @desc    Get workout variety suggestions
// @route   GET /api/ai/variety-suggestions
// @access  Private
const getVarietySuggestions = asyncHandler(async (req, res) => {
  const result = await aiRecommendationService.getWorkoutRecommendations(
    req.user.id,
    { focus_variety: true }
  );

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message
    });
  }

  // Filter for variety-based recommendations
  const varietyRecs = result.data.recommendations.filter(
    rec => rec.type === 'variety'
  );

  const suggestions = {
    new_exercises: varietyRecs.map(rec => ({
      exercise: rec.exercise,
      reason: rec.reason,
      difficulty_match: rec.exercise.difficulty_level === req.user.fitness_level,
      suggested_sets: rec.suggested_sets,
      suggested_reps: rec.suggested_reps
    })),
    variety_score: Math.min(100, varietyRecs.length * 10),
    recommendations: varietyRecs.slice(0, 5)
  };

  res.json({
    success: true,
    data: {
      variety_suggestions: suggestions
    }
  });
});

// @desc    Get fitness goal insights
// @route   GET /api/ai/goal-insights
// @access  Private
const getGoalInsights = asyncHandler(async (req, res) => {
  const userGoals = req.user.goals || [];
  
  if (userGoals.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No fitness goals set. Please update your profile with your goals.'
    });
  }

  const result = await aiRecommendationService.getWorkoutRecommendations(
    req.user.id,
    { focus_goals: true }
  );

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message
    });
  }

  const goalBasedRecs = result.data.recommendations.filter(
    rec => rec.type === 'goal_based'
  );

  const insights = {
    current_goals: userGoals,
    goal_alignment_score: Math.min(100, goalBasedRecs.length * 15),
    recommendations_by_goal: userGoals.map(goal => ({
      goal,
      recommendations: goalBasedRecs.filter(rec => rec.reason.includes(goal)),
      priority: goal === 'strength' ? 'high' : 'medium'
    })),
    next_steps: goalBasedRecs.slice(0, 3).map(rec => ({
      action: `Add ${rec.exercise.name} to your routine`,
      reason: rec.reason,
      priority: rec.score > 0.8 ? 'high' : 'medium'
    }))
  };

  res.json({
    success: true,
    data: {
      goal_insights: insights
    }
  });
});

// @desc    Get AI fitness assessment
// @route   GET /api/ai/fitness-assessment
// @access  Private
const getFitnessAssessment = asyncHandler(async (req, res) => {
  const user = req.user;
  const userWorkouts = await aiRecommendationService.getUserWorkoutHistory(user.id, 20);

  const assessment = {
    fitness_level: user.fitness_level,
    estimated_experience: userWorkouts.length > 50 ? 'experienced' : 
                         userWorkouts.length > 20 ? 'intermediate' : 'beginner',
    consistency_score: Math.min(100, userWorkouts.length * 2),
    strength_indicators: {
      workout_frequency: userWorkouts.length,
      variety_score: new Set(userWorkouts.flatMap(w => 
        w.workoutExercises.map(we => we.exercise.category)
      )).size * 20,
      progression_trend: userWorkouts.length > 5 ? 'improving' : 'establishing'
    },
    recommendations: [
      {
        category: 'frequency',
        message: userWorkouts.length < 10 ? 
          'Try to maintain consistency with 3-4 workouts per week' :
          'Great consistency! Keep up the regular training schedule'
      },
      {
        category: 'variety',
        message: 'Consider adding new exercise categories to prevent plateau'
      },
      {
        category: 'progression',
        message: 'Focus on progressive overload to continue improving'
      }
    ],
    next_milestone: user.fitness_level === 'beginner' ? 'intermediate' : 'advanced',
    estimated_time_to_next_level: user.fitness_level === 'beginner' ? '8-12 weeks' : '12-16 weeks'
  };

  res.json({
    success: true,
    data: {
      fitness_assessment: assessment
    }
  });
});

module.exports = {
  getWorkoutRecommendations,
  getExerciseRecommendations,
  generateWorkoutPlan,
  getPersonalizedWorkout,
  getProgressiveTraining,
  getMuscleBalanceAnalysis,
  getVarietySuggestions,
  getGoalInsights,
  getFitnessAssessment
};