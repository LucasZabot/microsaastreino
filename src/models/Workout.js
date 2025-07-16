const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Workout = sequelize.define('Workout', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  category: {
    type: DataTypes.ENUM(
      'strength',
      'cardio',
      'flexibility',
      'full_body',
      'upper_body',
      'lower_body',
      'core',
      'sports_specific',
      'rehabilitation'
    ),
    allowNull: false
  },
  difficulty_level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estimated_calories: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  muscle_groups: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  equipment_needed: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  is_template: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_premium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'completed', 'archived'),
    defaultValue: 'draft'
  },
  scheduled_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  created_by_ai: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ai_parameters: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  total_sets: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_reps: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_weight: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
});

module.exports = Workout;