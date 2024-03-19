const Joi = require("joi");

const subscriptionDTO = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  pricing: Joi.array().items(
    Joi.object({
      duration: Joi.number().required(),
      price: Joi.number().required(),
    })
  ).required(),
  features: Joi.array().items(Joi.string()).required(),
});

module.exports = subscriptionDTO;
