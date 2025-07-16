const express = require('express');
const router = express.Router();
const {
  getWorkoutRecommendations,
  getExerciseRecommendations,
  generateWorkoutPlan,
  getPersonalizedWorkout,
  getProgressiveTraining,
  getMuscleBalanceAnalysis,
  getVarietySuggestions,
  getGoalInsights,
  getFitnessAssessment
} = require('../controllers/aiController');
const { auth } = require('../middleware/auth');

// All AI routes require authentication
router.use(auth);

// Recommendations
router.get('/recommendations/workouts', getWorkoutRecommendations);
router.get('/recommendations/exercises', getExerciseRecommendations);

// Workout generation
router.post('/generate-plan', generateWorkoutPlan);
router.post('/personalized-workout', getPersonalizedWorkout);

// Training insights
router.get('/progressive-training', getProgressiveTraining);
router.get('/muscle-balance', getMuscleBalanceAnalysis);
router.get('/variety-suggestions', getVarietySuggestions);
router.get('/goal-insights', getGoalInsights);
router.get('/fitness-assessment', getFitnessAssessment);

module.exports = router;