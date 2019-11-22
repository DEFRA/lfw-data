'use strict'
const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()
AWS.config.update({ region: process.env.LFW_TARGET_REGION })
const fs = require('fs')

lab.experiment('Test stationProcess lambda invoke', () => {
  lab.test('stationProcess invoke', async () => {
    try {
      const data = await lambda.invoke({
        FunctionName: `${process.env.LFW_TARGET_ENV_NAME}lfw-stationProcess`,
        InvocationType: 'RequestResponse',
        Payload: fs.readFileSync('./test/events/station-event.json')
      }).promise()
      console.log(data)
      if (data.StatusCode !== 200) {
        throw new Error('stationProcess non 200 response')
      }
      const payload = JSON.parse(data.Payload)
      if (payload && payload.errorMessage) {
        throw new Error('stationProcess error returned: ' + payload.errorMessage)
      }
    } catch (err) {
      throw err
    }
  })
})
