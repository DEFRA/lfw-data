'use strict'
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()

lab.experiment('Test rloiProcess lambda invoke', () => {
  lab.test('rloiProcess invoke no event expect error', async () => {
    try {
      const data = await lambda.invoke({ FunctionName: `${process.env.LFW_SLS_BUCKET}-rloiProcess` }).promise()
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
