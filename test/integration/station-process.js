'use strict'
const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()
AWS.config.update({ region: process.env.LFW_DATA_TARGET_REGION })

lab.experiment('Test stationProcess lambda invoke', () => {
  lab.test('stationProcess invoke', async () => {
    const event = {
      Records: [
        {
          s3: {
            bucket: {
              name: process.env.LFW_DATA_SLS_BUCKET
            },
            object: {
              key: 'fwfidata/ENT_7010/rloiStationData.csv'
            }
          }
        }
      ]
    }
    const data = await lambda.invoke({
      FunctionName: `${process.env.LFW_DATA_TARGET_ENV_NAME}${process.env.LFW_DATA_SERVICE_CODE}-stationProcess`,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify(event)
    }).promise()
    if (data.StatusCode !== 200) {
      throw new Error('stationProcess non 200 response')
    }
    const payload = JSON.parse(data.Payload)
    if (payload && payload.errorMessage) {
      throw new Error('stationProcess error returned: ' + payload.errorMessage)
    }
  })
})
