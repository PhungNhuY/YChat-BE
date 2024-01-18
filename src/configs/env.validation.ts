import * as Joi from 'joi';

const validationSchema = Joi.object({
  PORT: Joi.number().required(),

  MONGODB_HOST: Joi.string().required(),
  MONGODB_PORT: Joi.number().required(),
  MONGODB_USER: Joi.string().required(),
  MONGODB_PASSWORD: Joi.string().required(),
  MONGODB_DBNAME: Joi.string().required(),
  MONGODB_VOLUME_PATH: Joi.string().required(),
});

export default validationSchema;
