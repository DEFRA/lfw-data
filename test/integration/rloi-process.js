'use strict'
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.LFW_TARGET_REGION })
const lambda = new AWS.Lambda()

lab.experiment('Test rloiProcess lambda invoke', () => {
  lab.test('rloiProcess invoke no event expect error', async () => {
    try {
      const data = await lambda.invoke({ FunctionName: `${process.env.LFW_TARGET_ENV_NAME}lfw-rloiProcess` }).promise()
      if (data.StatusCode !== 200) {
        throw new Error('rloiProcess non 200 response')
      }
      const payload = JSON.parse(data.Payload)
      if (!payload || !payload.errorMessage) {
        throw new Error('rloiProcess should have errored')
      }
    } catch (err) {
      throw err
    }
  })
})
