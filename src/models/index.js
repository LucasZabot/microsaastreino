const { sequelize } = require('../config/database');
const User = require('./User');
const Exercise = require('./Exercise');
const Workout = require('./Workout');
const WorkoutExercise = require('./WorkoutExercise');
const Subscription = require('./Subscription');
const Payment = require('./Payment');

// Define associations
User.hasMany(Workout, { foreignKey: 'user_id', as: 'workouts' });
Workout.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Exercise, { foreignKey: 'created_by', as: 'createdExercises' });
Exercise.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Workout.hasMany(WorkoutExercise, { foreignKey: 'workout_id', as: 'workoutExercises' });
WorkoutExercise.belongsTo(Workout, { foreignKey: 'workout_id', as: 'workout' });

Exercise.hasMany(WorkoutExercise, { foreignKey: 'exercise_id', as: 'workoutExercises' });
WorkoutExercise.belongsTo(Exercise, { foreignKey: 'exercise_id', as: 'exercise' });

User.hasMany(Subscription, { foreignKey: 'user_id', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Subscription.hasMany(Payment, { foreignKey: 'subscription_id', as: 'payments' });
Payment.belongsTo(Subscription, { foreignKey: 'subscription_id', as: 'subscription' });

// Many-to-many relationship between Workout and Exercise through WorkoutExercise
Workout.belongsToMany(Exercise, { 
  through: WorkoutExercise, 
  foreignKey: 'workout_id', 
  otherKey: 'exercise_id',
  as: 'exercises'
});

Exercise.belongsToMany(Workout, { 
  through: WorkoutExercise, 
  foreignKey: 'exercise_id', 
  otherKey: 'workout_id',
  as: 'workouts'
});

module.exports = {
  sequelize,
  User,
  Exercise,
  Workout,
  WorkoutExercise,
  Subscription,
  Payment
};