const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
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
  subscription_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Subscriptions',
      key: 'id'
    }
  },
  stripe_payment_intent_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  stripe_charge_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'usd'
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'succeeded',
      'failed',
      'canceled',
      'refunded',
      'partially_refunded'
    ),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  receipt_email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  failure_reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  refunded_amount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  refunded_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  invoice_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Payment;