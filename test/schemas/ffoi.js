const Joi = require('@hapi/joi')

module.exports = Joi.object({
  $: Joi.object().keys({
    date: Joi.string(),
    key: Joi.string().required(),
    stationName: Joi.string().required(),
    stationReference: Joi.string().required(),
    time: Joi.string()
  }),
  SetofValues: Joi.array().items(Joi.object().keys({
    $: Joi.object().required(),
    Value: Joi.array().items(Joi.object().keys({
      _: Joi.number().required(),
      $: Joi.object().keys({
        date: Joi.string().required(),
        time: Joi.string().required()
      }).unknown(true)
    })).required()
  })).required()
})
