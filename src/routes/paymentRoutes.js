const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  createSubscription,
  cancelSubscription,
  reactivateSubscription,
  getSubscriptions,
  getPaymentHistory,
  handleWebhook,
  getPlans
} = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');
const { validateParams, validateQuery, schemas } = require('../middleware/validation');

// Public routes
router.get('/plans', getPlans);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(auth);

router.post('/create-intent', createPaymentIntent);
router.post('/subscribe', createSubscription);
router.get('/subscriptions', getSubscriptions);
router.delete('/subscription/:id', validateParams(schemas.uuid), cancelSubscription);
router.post('/subscription/:id/reactivate', validateParams(schemas.uuid), reactivateSubscription);
router.get('/history', validateQuery(schemas.pagination), getPaymentHistory);

module.exports = router;