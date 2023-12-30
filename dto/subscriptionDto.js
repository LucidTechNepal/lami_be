const Joi = require("joi");
const subscriptionDTO = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  duration: Joi.array().items(Joi.number()).required(),
  features: Joi.array().items(Joi.string()).required(),
});

module.exports = subscriptionDTO;
