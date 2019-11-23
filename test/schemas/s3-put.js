const Joi = require('@hapi/joi')

module.exports = Joi.object({
  Key: Joi.string().required(),
  Bucket: Joi.string().required(),
  Body: Joi.string().required()
})
