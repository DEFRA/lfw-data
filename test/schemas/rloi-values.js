const Joi = require('joi')

module.exports = {
  query: Joi.object().keys({
    text: Joi.string().regex(/\bINSERT INTO "sls_telemetry_value/),
    values: Joi.array().sparse()
  })
}
