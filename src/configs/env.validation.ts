import * as Joi from 'joi';

const validationSchema = Joi.object({
  PORT: Joi.number().required(),
  NODE_ENV: Joi.string().required().valid('development', 'production'),

  MONGODB_DBNAME: Joi.string().required(),
  MONGODB_CONNECTION_STRING: Joi.string().required(),

  MONGODB_VOLUME_PATH: Joi.string().required(),

  ACCESS_TOKEN_EXPIRATION_TIME: Joi.number().required(),
  REFRESH_TOKEN_EXPIRATION_TIME: Joi.number().required(),
  ACTIVATE_EMAIL_TOKEN_EXPIRATION_TIME: Joi.number().required(),

  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_USER: Joi.string().email().required(),
  SMTP_PASS: Joi.string().required(),
});

export default validationSchema;
