const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage
      });
    }
    
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Query validation error',
        errors: errorMessage
      });
    }
    
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Parameter validation error',
        errors: errorMessage
      });
    }
    
    next();
  };
};

// Common validation schemas
const schemas = {
  user: {
    register: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(100).required(),
      birth_date: Joi.date().optional(),
      gender: Joi.string().valid('male', 'female', 'other').optional(),
      height: Joi.number().positive().optional(),
      weight: Joi.number().positive().optional(),
      fitness_level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
      goals: Joi.array().items(Joi.string()).optional(),
      injuries: Joi.array().items(Joi.string()).optional()
    }),
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }),
    updateProfile: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      birth_date: Joi.date().optional(),
      gender: Joi.string().valid('male', 'female', 'other').optional(),
      height: Joi.number().positive().optional(),
      weight: Joi.number().positive().optional(),
      fitness_level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
      goals: Joi.array().items(Joi.string()).optional(),
      preferred_workout_duration: Joi.number().integer().min(10).max(300).optional(),
      preferred_workout_days: Joi.array().items(Joi.number().integer().min(0).max(6)).optional(),
      injuries: Joi.array().items(Joi.string()).optional()
    })
  },
  exercise: {
    create: Joi.object({
      name: Joi.string().min(2).max(200).required(),
      description: Joi.string().optional(),
      instructions: Joi.string().optional(),
      category: Joi.string().valid(
        'strength', 'cardio', 'flexibility', 'sports', 
        'powerlifting', 'olympic_weightlifting', 'stretching', 'plyometrics'
      ).required(),
      muscle_groups: Joi.array().items(Joi.string()).required(),
      primary_muscles: Joi.array().items(Joi.string()).required(),
      secondary_muscles: Joi.array().items(Joi.string()).optional(),
      equipment: Joi.array().items(Joi.string()).required(),
      difficulty_level: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
      force_type: Joi.string().valid('push', 'pull', 'static').optional(),
      mechanics: Joi.string().valid('compound', 'isolation').optional(),
      video_url: Joi.string().uri().optional(),
      tips: Joi.array().items(Joi.string()).optional(),
      safety_notes: Joi.array().items(Joi.string()).optional(),
      calories_per_minute: Joi.number().positive().optional(),
      rest_time_seconds: Joi.number().integer().min(0).optional()
    }),
    update: Joi.object({
      name: Joi.string().min(2).max(200).optional(),
      description: Joi.string().optional(),
      instructions: Joi.string().optional(),
      category: Joi.string().valid(
        'strength', 'cardio', 'flexibility', 'sports', 
        'powerlifting', 'olympic_weightlifting', 'stretching', 'plyometrics'
      ).optional(),
      muscle_groups: Joi.array().items(Joi.string()).optional(),
      primary_muscles: Joi.array().items(Joi.string()).optional(),
      secondary_muscles: Joi.array().items(Joi.string()).optional(),
      equipment: Joi.array().items(Joi.string()).optional(),
      difficulty_level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
      force_type: Joi.string().valid('push', 'pull', 'static').optional(),
      mechanics: Joi.string().valid('compound', 'isolation').optional(),
      video_url: Joi.string().uri().optional(),
      tips: Joi.array().items(Joi.string()).optional(),
      safety_notes: Joi.array().items(Joi.string()).optional(),
      calories_per_minute: Joi.number().positive().optional(),
      rest_time_seconds: Joi.number().integer().min(0).optional()
    })
  },
  workout: {
    create: Joi.object({
      name: Joi.string().min(2).max(200).required(),
      description: Joi.string().optional(),
      category: Joi.string().valid(
        'strength', 'cardio', 'flexibility', 'full_body', 
        'upper_body', 'lower_body', 'core', 'sports_specific', 'rehabilitation'
      ).required(),
      difficulty_level: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
      duration_minutes: Joi.number().integer().min(5).max(300).required(),
      muscle_groups: Joi.array().items(Joi.string()).optional(),
      equipment_needed: Joi.array().items(Joi.string()).optional(),
      is_template: Joi.boolean().optional(),
      is_public: Joi.boolean().optional(),
      scheduled_date: Joi.date().optional(),
      notes: Joi.string().optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      exercises: Joi.array().items(Joi.object({
        exercise_id: Joi.string().uuid().required(),
        order: Joi.number().integer().min(1).required(),
        sets: Joi.number().integer().min(1).required(),
        reps: Joi.number().integer().min(1).optional(),
        weight: Joi.number().positive().optional(),
        duration_seconds: Joi.number().integer().min(1).optional(),
        distance_meters: Joi.number().positive().optional(),
        rest_time_seconds: Joi.number().integer().min(0).optional(),
        notes: Joi.string().optional()
      })).optional()
    }),
    update: Joi.object({
      name: Joi.string().min(2).max(200).optional(),
      description: Joi.string().optional(),
      category: Joi.string().valid(
        'strength', 'cardio', 'flexibility', 'full_body', 
        'upper_body', 'lower_body', 'core', 'sports_specific', 'rehabilitation'
      ).optional(),
      difficulty_level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
      duration_minutes: Joi.number().integer().min(5).max(300).optional(),
      muscle_groups: Joi.array().items(Joi.string()).optional(),
      equipment_needed: Joi.array().items(Joi.string()).optional(),
      is_template: Joi.boolean().optional(),
      is_public: Joi.boolean().optional(),
      scheduled_date: Joi.date().optional(),
      notes: Joi.string().optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      rating: Joi.number().integer().min(1).max(5).optional()
    })
  },
  uuid: Joi.object({
    id: Joi.string().uuid().required()
  }),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('ASC', 'DESC').default('ASC')
  })
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
  schemas
};