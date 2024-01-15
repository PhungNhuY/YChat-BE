import * as Joi from 'joi';

const validationSchema = Joi.object({
  PORT: Joi.number().required(),
});

export default validationSchema;
