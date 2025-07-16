const express = require('express');
const router = express.Router();
const {
  getExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  getCategories,
  getMuscleGroups,
  getEquipment,
  getPopularExercises
} = require('../controllers/exerciseController');
const { auth, optionalAuth } = require('../middleware/auth');
const { validate, validateParams, validateQuery, schemas } = require('../middleware/validation');

// Public routes
router.get('/', optionalAuth, validateQuery(schemas.pagination), getExercises);
router.get('/categories', getCategories);
router.get('/muscle-groups', getMuscleGroups);
router.get('/equipment', getEquipment);
router.get('/popular', optionalAuth, getPopularExercises);
router.get('/:id', optionalAuth, validateParams(schemas.uuid), getExercise);

// Protected routes
router.post('/', auth, validate(schemas.exercise.create), createExercise);
router.put('/:id', auth, validateParams(schemas.uuid), validate(schemas.exercise.update), updateExercise);
router.delete('/:id', auth, validateParams(schemas.uuid), deleteExercise);

module.exports = router;