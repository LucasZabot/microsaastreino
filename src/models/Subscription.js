const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  stripe_subscription_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  stripe_customer_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stripe_price_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'active',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'past_due',
      'unpaid',
      'trialing'
    ),
    allowNull: false
  },
  current_period_start: {
    type: DataTypes.DATE,
    allowNull: false
  },
  current_period_end: {
    type: DataTypes.DATE,
    allowNull: false
  },
  cancel_at_period_end: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  canceled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  trial_start: {
    type: DataTypes.DATE,
    allowNull: true
  },
  trial_end: {
    type: DataTypes.DATE,
    allowNull: true
  },
  plan_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  plan_interval: {
    type: DataTypes.ENUM('day', 'week', 'month', 'year'),
    allowNull: false
  },
  plan_amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  plan_currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'usd'
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
});

module.exports = Subscription;