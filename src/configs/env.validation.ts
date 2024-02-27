import * as Joi from 'joi';

const validationSchema = Joi.object({
  PORT: Joi.number().required(),
  NODE_ENV: Joi.string().required().valid('development', 'production'),

  MONGODB_HOST: Joi.string().required(),
  MONGODB_PORT: Joi.number().required(),
  MONGODB_USER: Joi.string().required(),
  MONGODB_PASSWORD: Joi.string().required(),
  MONGODB_DBNAME: Joi.string().required(),
  MONGODB_VOLUME_PATH: Joi.string().required(),

  ACCESS_TOKEN_EXPIRATION_TIME: Joi.number().required(),
  REFRESH_TOKEN_EXPIRATION_TIME: Joi.number().required(),
});

export default validationSchema;
