const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User, Subscription, Payment } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'usd', description } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      description,
      metadata: {
        user_id: req.user.id,
        user_email: req.user.email
      }
    });

    res.json({
      success: true,
      data: {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message
    });
  }
});

// @desc    Create subscription
// @route   POST /api/payments/subscribe
// @access  Private
const createSubscription = asyncHandler(async (req, res) => {
  const { price_id, payment_method_id } = req.body;

  try {
    // Get or create Stripe customer
    let customer;
    const existingCustomer = await stripe.customers.list({
      email: req.user.email,
      limit: 1
    });

    if (existingCustomer.data.length > 0) {
      customer = existingCustomer.data[0];
    } else {
      customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          user_id: req.user.id
        }
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: customer.id
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: payment_method_id
      }
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price_id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });

    // Get price information
    const price = await stripe.prices.retrieve(price_id);
    const product = await stripe.products.retrieve(price.product);

    // Save subscription to database
    await Subscription.create({
      user_id: req.user.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customer.id,
      stripe_price_id: price_id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      plan_name: product.name,
      plan_interval: price.recurring.interval,
      plan_amount: price.unit_amount,
      plan_currency: price.currency
    });

    // Update user premium status
    await req.user.update({ is_premium: true });

    res.json({
      success: true,
      data: {
        subscription_id: subscription.id,
        client_secret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating subscription',
      error: error.message
    });
  }
});

// @desc    Cancel subscription
// @route   DELETE /api/payments/subscription/:id
// @access  Private
const cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id
    }
  });

  if (!subscription) {
    return res.status(404).json({
      success: false,
      message: 'Subscription not found'
    });
  }

  try {
    // Cancel subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true
      }
    );

    // Update subscription in database
    await subscription.update({
      cancel_at_period_end: true,
      status: stripeSubscription.status
    });

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current period',
      data: {
        subscription: subscription
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error canceling subscription',
      error: error.message
    });
  }
});

// @desc    Reactivate subscription
// @route   POST /api/payments/subscription/:id/reactivate
// @access  Private
const reactivateSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    where: {
      id: req.params.id,
      user_id: req.user.id
    }
  });

  if (!subscription) {
    return res.status(404).json({
      success: false,
      message: 'Subscription not found'
    });
  }

  try {
    // Reactivate subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: false
      }
    );

    // Update subscription in database
    await subscription.update({
      cancel_at_period_end: false,
      status: stripeSubscription.status
    });

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      data: {
        subscription: subscription
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error reactivating subscription',
      error: error.message
    });
  }
});

// @desc    Get user subscriptions
// @route   GET /api/payments/subscriptions
// @access  Private
const getSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.findAll({
    where: {
      user_id: req.user.id
    },
    order: [['created_at', 'DESC']]
  });

  res.json({
    success: true,
    data: {
      subscriptions
    }
  });
});

// @desc    Get user payments
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const { count, rows } = await Payment.findAndCountAll({
    where: {
      user_id: req.user.id
    },
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [
      {
        model: Subscription,
        as: 'subscription',
        attributes: ['plan_name', 'plan_interval']
      }
    ]
  });

  res.json({
    success: true,
    data: {
      payments: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    }
  });
});

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(400).json({ error: error.message });
  }
});

// Helper functions for webhook handling
const handleInvoicePaymentSucceeded = async (invoice) => {
  const subscription = await Subscription.findOne({
    where: { stripe_subscription_id: invoice.subscription }
  });

  if (subscription) {
    await Payment.create({
      user_id: subscription.user_id,
      subscription_id: subscription.id,
      stripe_payment_intent_id: invoice.payment_intent,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded',
      description: `Payment for ${subscription.plan_name}`,
      processed_at: new Date()
    });

    // Update user premium status
    await User.update(
      { is_premium: true },
      { where: { id: subscription.user_id } }
    );
  }
};

const handleInvoicePaymentFailed = async (invoice) => {
  const subscription = await Subscription.findOne({
    where: { stripe_subscription_id: invoice.subscription }
  });

  if (subscription) {
    await Payment.create({
      user_id: subscription.user_id,
      subscription_id: subscription.id,
      stripe_payment_intent_id: invoice.payment_intent,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      description: `Failed payment for ${subscription.plan_name}`,
      failure_reason: 'Payment failed',
      processed_at: new Date()
    });
  }
};

const handleSubscriptionUpdated = async (stripeSubscription) => {
  const subscription = await Subscription.findOne({
    where: { stripe_subscription_id: stripeSubscription.id }
  });

  if (subscription) {
    await subscription.update({
      status: stripeSubscription.status,
      current_period_start: new Date(stripeSubscription.current_period_start * 1000),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end
    });

    // Update user premium status based on subscription status
    const isPremium = ['active', 'trialing'].includes(stripeSubscription.status);
    await User.update(
      { is_premium: isPremium },
      { where: { id: subscription.user_id } }
    );
  }
};

const handleSubscriptionDeleted = async (stripeSubscription) => {
  const subscription = await Subscription.findOne({
    where: { stripe_subscription_id: stripeSubscription.id }
  });

  if (subscription) {
    await subscription.update({
      status: 'canceled',
      ended_at: new Date()
    });

    // Remove premium status
    await User.update(
      { is_premium: false },
      { where: { id: subscription.user_id } }
    );
  }
};

// @desc    Get available plans
// @route   GET /api/payments/plans
// @access  Public
const getPlans = asyncHandler(async (req, res) => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product']
    });

    const plans = prices.data.map(price => ({
      id: price.id,
      name: price.product.name,
      description: price.product.description,
      amount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval,
      interval_count: price.recurring?.interval_count,
      features: price.product.metadata?.features?.split(',') || []
    }));

    res.json({
      success: true,
      data: {
        plans
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error fetching plans',
      error: error.message
    });
  }
});

module.exports = {
  createPaymentIntent,
  createSubscription,
  cancelSubscription,
  reactivateSubscription,
  getSubscriptions,
  getPaymentHistory,
  handleWebhook,
  getPlans
};