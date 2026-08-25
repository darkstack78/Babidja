import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3001),
  FRONTEND_URL: Joi.string().uri().required(),

  DATABASE_URL: Joi.string().uri({ scheme: [/postgres(ql)?/] }).required(),
  REDIS_URL: Joi.string().uri({ scheme: ['redis', 'rediss'] }).required(),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CALLBACK_URL: Joi.string().optional(),

  CINETPAY_API_KEY: Joi.string().optional(),
  CINETPAY_SITE_ID: Joi.string().optional(),
  CINETPAY_WEBHOOK_SECRET: Joi.string().optional(),
  CINETPAY_NOTIFY_URL: Joi.string().optional(),
  CINETPAY_RETURN_URL: Joi.string().optional(),

  SMS_PROVIDER: Joi.string().default('africastalking'),
  AT_API_KEY: Joi.string().optional(),
  AT_USERNAME: Joi.string().optional(),
  AT_SENDER_ID: Joi.string().optional(),

  R2_ACCOUNT_ID: Joi.string().optional(),
  R2_ACCESS_KEY_ID: Joi.string().optional(),
  R2_SECRET_ACCESS_KEY: Joi.string().optional(),
  R2_BUCKET_NAME: Joi.string().optional(),
  R2_PUBLIC_URL: Joi.string().optional(),

  FIREBASE_PROJECT_ID: Joi.string().optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().optional(),

  REFERRAL_REWARD_AMOUNT: Joi.string().optional(),
  DEPOSIT_RATE_DEFAULT: Joi.number().default(0.3),
}).unknown(true);
