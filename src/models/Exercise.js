const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Exercise = sequelize.define('Exercise', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'strength',
      'cardio',
      'flexibility',
      'sports',
      'powerlifting',
      'olympic_weightlifting',
      'stretching',
      'plyometrics'
    ),
    allowNull: false
  },
  muscle_groups: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  primary_muscles: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  secondary_muscles: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  equipment: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  difficulty_level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false,
    defaultValue: 'beginner'
  },
  force_type: {
    type: DataTypes.ENUM('push', 'pull', 'static'),
    allowNull: true
  },
  mechanics: {
    type: DataTypes.ENUM('compound', 'isolation'),
    allowNull: true
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  video_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tips: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  safety_notes: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_premium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  calories_per_minute: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  rest_time_seconds: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  }
});

module.exports = Exercise;