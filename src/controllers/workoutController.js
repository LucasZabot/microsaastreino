const { Op } = require('sequelize');
const { Workout, Exercise, WorkoutExercise, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all workouts for user
// @route   GET /api/workouts
// @access  Private
const getWorkouts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Build filter conditions
  const where = {
    user_id: req.user.id
  };

  if (req.query.category) {
    where.category = req.query.category;
  }

  if (req.query.difficulty_level) {
    where.difficulty_level = req.query.difficulty_level;
  }

  if (req.query.status) {
    where.status = req.query.status;
  }

  if (req.query.is_template) {
    where.is_template = req.query.is_template === 'true';
  }

  if (req.query.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${req.query.search}%` } },
      { description: { [Op.iLike]: `%${req.query.search}%` } }
    ];
  }

  if (req.query.date_from || req.query.date_to) {
    where.scheduled_date = {};
    if (req.query.date_from) {
      where.scheduled_date[Op.gte] = new Date(req.query.date_from);
    }
    if (req.query.date_to) {
      where.scheduled_date[Op.lte] = new Date(req.query.date_to);
    }
  }

  const { count, rows } = await Workout.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [
      {
        model: WorkoutExercise,
        as: 'workoutExercises',
        include: [
          {
            model: Exercise,
            as: 'exercise',
            attributes: ['name', 'category', 'muscle_groups']
          }
        ]
      }
    ]
  });

  res.json({
    success: true,
    data: {
      workouts: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    }
  });
});

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
const getWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id
    },
    include: [
      {
        model: WorkoutExercise,
        as: 'workoutExercises',
        include: [
          {
            model: Exercise,
            as: 'exercise'
          }
        ],
        order: [['order', 'ASC']]
      }
    ]
  });

  if (!workout) {
    return res.status(404).json({
      success: false,
      message: 'Workout not found'
    });
  }

  res.json({
    success: true,
    data: {
      workout
    }
  });
});

// @desc    Create workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = asyncHandler(async (req, res) => {
  const { exercises, ...workoutData } = req.body;

  // Create workout
  const workout = await Workout.create({
    ...workoutData,
    user_id: req.user.id
  });

  // Add exercises to workout if provided
  if (exercises && exercises.length > 0) {
    const workoutExercises = exercises.map(exercise => ({
      workout_id: workout.id,
      exercise_id: exercise.exercise_id,
      order: exercise.order,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      duration_seconds: exercise.duration_seconds,
      distance_meters: exercise.distance_meters,
      rest_time_seconds: exercise.rest_time_seconds,
      notes: exercise.notes
    }));

    await WorkoutExercise.bulkCreate(workoutExercises);
  }

  // Fetch complete workout with exercises
  const completeWorkout = await Workout.findByPk(workout.id, {
    include: [
      {
        model: WorkoutExercise,
        as: 'workoutExercises',
        include: [
          {
            model: Exercise,
            as: 'exercise'
          }
        ],
        order: [['order', 'ASC']]
      }
    ]
  });

  res.status(201).json({
    success: true,
    message: 'Workout created successfully',
    data: {
      workout: completeWorkout
    }
  });
});

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id
    }
  });

  if (!workout) {
    return res.status(404).json({
      success: false,
      message: 'Workout not found'
    });
  }

  const allowedUpdates = [
    'name', 'description', 'category', 'difficulty_level', 'duration_minutes',
    'muscle_groups', 'equipment_needed', 'is_template', 'is_public',
    'scheduled_date', 'notes', 'tags', 'rating', 'status'
  ];

  const updates = {};
  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  await workout.update(updates);

  const updatedWorkout = await Workout.findByPk(workout.id, {
    include: [
      {
        model: WorkoutExercise,
        as: 'workoutExercises',
        include: [
          {
            model: Exercise,
            as: 'exercise'
          }
        ],
        order: [['order', 'ASC']]
      }
    ]
  });

  res.json({
    success: true,
    message: 'Workout updated successfully',
    data: {
      workout: updatedWorkout
    }
  });
});

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id
    }
  });

  if (!workout) {
    return res.status(404).json({
      success: false,
      message: 'Workout not found'
    });
  }

  // Delete associated workout exercises
  await WorkoutExercise.destroy({
    where: { workout_id: workout.id }
  });

  // Delete workout
  await workout.destroy();

  res.json({
    success: true,
    message: 'Workout deleted successfully'
  });
});

// @desc    Start workout
// @route   POST /api/workouts/:id/start
// @access  Private
const startWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id
    }
  });

  if (!workout) {
    return res.status(404).json({
      success: false,
      message: 'Workout not found'
    });
  }

  if (workout.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot start a completed workout'
    });
  }

  await workout.update({
    status: 'active',
    started_at: new Date()
  });

  res.json({
    success: true,
    message: 'Workout started successfully',
    data: {
      workout
    }
  });
});

// @desc    Complete workout
// @route   POST /api/workouts/:id/complete
// @access  Private
const completeWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id
    }
  });

  if (!workout) {
    return res.status(404).json({
      success: false,
      message: 'Workout not found'
    });
  }

  if (workout.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Workout already completed'
    });
  }

  await workout.update({
    status: 'completed',
    completed_at: new Date()
  });

  res.json({
    success: true,
    message: 'Workout completed successfully',
    data: {
      workout
    }
  });
});

// @desc    Add exercise to workout
// @route   POST /api/workouts/:id/exercises
// @access  Private
const addExerciseToWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id
    }
  });

  if (!workout) {
    return res.status(404).json({
      success: false,
      message: 'Workout not found'
    });
  }

  const exercise = await Exercise.findByPk(req.body.exercise_id);
  if (!exercise) {
    return res.status(404).json({
      success: false,
      message: 'Exercise not found'
    });
  }

  const workoutExercise = await WorkoutExercise.create({
    workout_id: workout.id,
    exercise_id: req.body.exercise_id,
    order: req.body.order || 1,
    sets: req.body.sets || 1,
    reps: req.body.reps,
    weight: req.body.weight,
    duration_seconds: req.body.duration_seconds,
    distance_meters: req.body.distance_meters,
    rest_time_seconds: req.body.rest_time_seconds,
    notes: req.body.notes
  });

  const workoutExerciseWithExercise = await WorkoutExercise.findByPk(workoutExercise.id, {
    include: [
      {
        model: Exercise,
        as: 'exercise'
      }
    ]
  });

  res.status(201).json({
    success: true,
    message: 'Exercise added to workout successfully',
    data: {
      workoutExercise: workoutExerciseWithExercise
    }
  });
});

// @desc    Update workout exercise
// @route   PUT /api/workouts/:workoutId/exercises/:exerciseId
// @access  Private
const updateWorkoutExercise = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({
    where: {
      id: req.params.workoutId,
      user_id: req.user.id
    }
  });

  if (!workout) {
    return res.status(404).json({
      success: false,
      message: 'Workout not found'
    });
  }

  const workoutExercise = await WorkoutExercise.findOne({
    where: {
      id: req.params.exerciseId,
      workout_id: workout.id
    }
  });

  if (!workoutExercise) {
    return res.status(404).json({
      success: false,
      message: 'Exercise not found in workout'
    });
  }

  const allowedUpdates = [
    'order', 'sets', 'reps', 'weight', 'duration_seconds', 'distance_meters',
    'rest_time_seconds', 'notes', 'is_completed', 'actual_sets', 'actual_reps',
    'actual_weight', 'actual_duration_seconds', 'actual_distance_meters',
    'difficulty_rating', 'rpe', 'form_rating', 'set_details'
  ];

  const updates = {};
  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  if (updates.is_completed) {
    updates.completed_at = new Date();
  }

  await workoutExercise.update(updates);

  const updatedWorkoutExercise = await WorkoutExercise.findByPk(workoutExercise.id, {
    include: [
      {
        model: Exercise,
        as: 'exercise'
      }
    ]
  });

  res.json({
    success: true,
    message: 'Workout exercise updated successfully',
    data: {
      workoutExercise: updatedWorkoutExercise
    }
  });
});

// @desc    Remove exercise from workout
// @route   DELETE /api/workouts/:workoutId/exercises/:exerciseId
// @access  Private
const removeExerciseFromWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({
    where: {
      id: req.params.workoutId,
      user_id: req.user.id
    }
  });

  if (!workout) {
    return res.status(404).json({
      success: false,
      message: 'Workout not found'
    });
  }

  const workoutExercise = await WorkoutExercise.findOne({
    where: {
      id: req.params.exerciseId,
      workout_id: workout.id
    }
  });

  if (!workoutExercise) {
    return res.status(404).json({
      success: false,
      message: 'Exercise not found in workout'
    });
  }

  await workoutExercise.destroy();

  res.json({
    success: true,
    message: 'Exercise removed from workout successfully'
  });
});

// @desc    Get workout statistics
// @route   GET /api/workouts/stats
// @access  Private
const getWorkoutStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { period = '30' } = req.query;
  
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - parseInt(period));

  const stats = await Workout.findAll({
    where: {
      user_id: userId,
      status: 'completed',
      completed_at: {
        [Op.gte]: dateFrom
      }
    },
    attributes: [
      'id', 'category', 'duration_minutes', 'estimated_calories',
      'completed_at', 'rating'
    ]
  });

  const totalWorkouts = stats.length;
  const totalMinutes = stats.reduce((sum, workout) => sum + workout.duration_minutes, 0);
  const totalCalories = stats.reduce((sum, workout) => sum + (workout.estimated_calories || 0), 0);
  const averageRating = stats.reduce((sum, workout) => sum + (workout.rating || 0), 0) / totalWorkouts || 0;

  const categoryStats = stats.reduce((acc, workout) => {
    acc[workout.category] = (acc[workout.category] || 0) + 1;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      period: parseInt(period),
      stats: {
        total_workouts: totalWorkouts,
        total_minutes: totalMinutes,
        total_calories: totalCalories,
        average_rating: Math.round(averageRating * 10) / 10,
        category_distribution: categoryStats
      }
    }
  });
});

module.exports = {
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
};