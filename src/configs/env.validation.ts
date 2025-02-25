import * as Joi from 'joi';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string().required().valid('development', 'production'),

  API_HOST: Joi.string().required(),
  PORT: Joi.number().required(),
  WS_PORT: Joi.number().required(),

  WEB_HOST: Joi.string().required(),
  WEB_HOST_TLS: Joi.boolean().required(),

  ACCESS_TOKEN_EXPIRATION_TIME: Joi.number().required(),
  REFRESH_TOKEN_EXPIRATION_TIME: Joi.number().required(),
  ACTIVATE_TOKEN_EXPIRATION_TIME: Joi.number().required(),

  MONGODB_DBNAME: Joi.string().required(),
  MONGODB_CONNECTION_STRING: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_PASSWORD: Joi.string().required(),

  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_USER: Joi.string().email().required(),
  SMTP_PASS: Joi.string().required(),

  MAX_FILE_SIZE: Joi.number().required(),
});

export default validationSchema;
