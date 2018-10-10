const Joi = require('joi')

module.exports = Joi.object().keys({
  Key: Joi.string().required(),
  Bucket: Joi.string().required(),
  Body: Joi.object().required()
})
