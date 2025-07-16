const { Op } = require('sequelize');
const { Exercise, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all exercises
// @route   GET /api/exercises
// @access  Public
const getExercises = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Build filter conditions
  const where = { is_active: true };
  
  if (req.query.category) {
    where.category = req.query.category;
  }
  
  if (req.query.difficulty_level) {
    where.difficulty_level = req.query.difficulty_level;
  }
  
  if (req.query.muscle_groups) {
    where.muscle_groups = {
      [Op.overlap]: req.query.muscle_groups.split(',')
    };
  }
  
  if (req.query.equipment) {
    where.equipment = {
      [Op.overlap]: req.query.equipment.split(',')
    };
  }
  
  if (req.query.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${req.query.search}%` } },
      { description: { [Op.iLike]: `%${req.query.search}%` } }
    ];
  }

  // Premium filter
  if (!req.user || !req.user.is_premium) {
    where.is_premium = false;
  }

  const { count, rows } = await Exercise.findAndCountAll({
    where,
    limit,
    offset,
    order: [['name', 'ASC']],
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['name'],
        required: false
      }
    ]
  });

  res.json({
    success: true,
    data: {
      exercises: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    }
  });
});

// @desc    Get single exercise
// @route   GET /api/exercises/:id
// @access  Public
const getExercise = asyncHandler(async (req, res) => {
  const exercise = await Exercise.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['name'],
        required: false
      }
    ]
  });

  if (!exercise || !exercise.is_active) {
    return res.status(404).json({
      success: false,
      message: 'Exercise not found'
    });
  }

  // Check premium access
  if (exercise.is_premium && (!req.user || !req.user.is_premium)) {
    return res.status(403).json({
      success: false,
      message: 'Premium subscription required'
    });
  }

  res.json({
    success: true,
    data: {
      exercise
    }
  });
});

// @desc    Create exercise
// @route   POST /api/exercises
// @access  Private
const createExercise = asyncHandler(async (req, res) => {
  const exerciseData = {
    ...req.body,
    created_by: req.user.id
  };

  const exercise = await Exercise.create(exerciseData);

  const exerciseWithCreator = await Exercise.findByPk(exercise.id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['name'],
        required: false
      }
    ]
  });

  res.status(201).json({
    success: true,
    message: 'Exercise created successfully',
    data: {
      exercise: exerciseWithCreator
    }
  });
});

// @desc    Update exercise
// @route   PUT /api/exercises/:id
// @access  Private
const updateExercise = asyncHandler(async (req, res) => {
  const exercise = await Exercise.findByPk(req.params.id);

  if (!exercise) {
    return res.status(404).json({
      success: false,
      message: 'Exercise not found'
    });
  }

  // Check if user owns the exercise or is admin
  if (exercise.created_by && exercise.created_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this exercise'
    });
  }

  const allowedUpdates = [
    'name', 'description', 'instructions', 'category', 'muscle_groups',
    'primary_muscles', 'secondary_muscles', 'equipment', 'difficulty_level',
    'force_type', 'mechanics', 'video_url', 'tips', 'safety_notes',
    'calories_per_minute', 'rest_time_seconds', 'is_active', 'is_premium'
  ];

  const updates = {};
  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  await exercise.update(updates);

  const updatedExercise = await Exercise.findByPk(exercise.id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['name'],
        required: false
      }
    ]
  });

  res.json({
    success: true,
    message: 'Exercise updated successfully',
    data: {
      exercise: updatedExercise
    }
  });
});

// @desc    Delete exercise
// @route   DELETE /api/exercises/:id
// @access  Private
const deleteExercise = asyncHandler(async (req, res) => {
  const exercise = await Exercise.findByPk(req.params.id);

  if (!exercise) {
    return res.status(404).json({
      success: false,
      message: 'Exercise not found'
    });
  }

  // Check if user owns the exercise or is admin
  if (exercise.created_by && exercise.created_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this exercise'
    });
  }

  // Soft delete
  await exercise.update({ is_active: false });

  res.json({
    success: true,
    message: 'Exercise deleted successfully'
  });
});

// @desc    Get exercise categories
// @route   GET /api/exercises/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = [
    'strength',
    'cardio',
    'flexibility',
    'sports',
    'powerlifting',
    'olympic_weightlifting',
    'stretching',
    'plyometrics'
  ];

  res.json({
    success: true,
    data: {
      categories
    }
  });
});

// @desc    Get muscle groups
// @route   GET /api/exercises/muscle-groups
// @access  Public
const getMuscleGroups = asyncHandler(async (req, res) => {
  const muscleGroups = [
    'chest',
    'back',
    'shoulders',
    'biceps',
    'triceps',
    'forearms',
    'core',
    'abs',
    'glutes',
    'quadriceps',
    'hamstrings',
    'calves',
    'traps',
    'lats',
    'middle_back',
    'lower_back',
    'neck'
  ];

  res.json({
    success: true,
    data: {
      muscle_groups: muscleGroups
    }
  });
});

// @desc    Get equipment list
// @route   GET /api/exercises/equipment
// @access  Public
const getEquipment = asyncHandler(async (req, res) => {
  const equipment = [
    'barbell',
    'dumbbell',
    'kettlebell',
    'cable',
    'machine',
    'bodyweight',
    'resistance_band',
    'medicine_ball',
    'stability_ball',
    'pull_up_bar',
    'bench',
    'foam_roller',
    'yoga_mat',
    'none'
  ];

  res.json({
    success: true,
    data: {
      equipment
    }
  });
});

// @desc    Get popular exercises
// @route   GET /api/exercises/popular
// @access  Public
const getPopularExercises = asyncHandler(async (req, res) => {
  const popularExercises = await Exercise.findAll({
    where: {
      is_active: true,
      is_premium: req.user && req.user.is_premium ? undefined : false
    },
    order: [['created_at', 'DESC']],
    limit: 10,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['name'],
        required: false
      }
    ]
  });

  res.json({
    success: true,
    data: {
      exercises: popularExercises
    }
  });
});

module.exports = {
  getExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  getCategories,
  getMuscleGroups,
  getEquipment,
  getPopularExercises
};