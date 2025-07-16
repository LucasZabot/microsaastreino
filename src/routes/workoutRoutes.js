const express = require('express');
const router = express.Router();
const {
  getWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  startWorkout,
  completeWorkout,
  addExerciseToWorkout,
  updateWorkoutExercise,
  removeExerciseFromWorkout,
  getWorkoutStats
} = require('../controllers/workoutController');
const { auth } = require('../middleware/auth');
const { validate, validateParams, validateQuery, schemas } = require('../middleware/validation');

// All workout routes require authentication
router.use(auth);

// Workout CRUD
router.get('/', validateQuery(schemas.pagination), getWorkouts);
router.get('/stats', getWorkoutStats);
router.get('/:id', validateParams(schemas.uuid), getWorkout);
router.post('/', validate(schemas.workout.create), createWorkout);
router.put('/:id', validateParams(schemas.uuid), validate(schemas.workout.update), updateWorkout);
router.delete('/:id', validateParams(schemas.uuid), deleteWorkout);

// Workout actions
router.post('/:id/start', validateParams(schemas.uuid), startWorkout);
router.post('/:id/complete', validateParams(schemas.uuid), completeWorkout);

// Workout exercises
router.post('/:id/exercises', validateParams(schemas.uuid), addExerciseToWorkout);
router.put('/:workoutId/exercises/:exerciseId', updateWorkoutExercise);
router.delete('/:workoutId/exercises/:exerciseId', removeExerciseFromWorkout);

module.exports = router;