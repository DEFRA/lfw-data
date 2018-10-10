'use strict'
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()

lab.experiment('Test rloirefresh lambda invoke', () => {
  lab.test('rloiRefresh invoke', async () => {
    try {
      const data = await lambda.invoke({ FunctionName: `${process.env.LFW_SLS_BUCKET}-rloiRefresh` }).promise()
      if (data.StatusCode !== 200) {
        throw new Error('rloirefresh non 200 response')
      }
      const payload = JSON.parse(data.Payload)
      if (payload && payload.errorMessage) {
        throw new Error('rloirefresh error returned: ' + payload.errorMessage)
      }
    } catch (err) {
      throw err
    }
  })
})
