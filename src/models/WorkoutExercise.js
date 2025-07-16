const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkoutExercise = sequelize.define('WorkoutExercise', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  workout_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Workouts',
      key: 'id'
    }
  },
  exercise_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Exercises',
      key: 'id'
    }
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sets: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  reps: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  weight: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  duration_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  distance_meters: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  rest_time_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actual_sets: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  actual_reps: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  actual_weight: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  actual_duration_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  actual_distance_meters: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  difficulty_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  },
  rpe: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  },
  form_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  set_details: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  superset_group: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_warmup: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_failure: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tempo: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = WorkoutExercise;