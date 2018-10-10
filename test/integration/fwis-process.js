'use strict'
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.LFW_TARGET_REGION })
const lambda = new AWS.Lambda()
const s3 = new AWS.S3()

let payload = {
  Records: [
    {
      s3: {
        bucket: {
          name: process.env.LFW_SLS_BUCKET
        },
        object: {
          key: ''
        }
      }
    }
  ]
}

lab.experiment('Test fwisProcess lambda invoke', () => {
  lab.test('fwisProcess invoke', async () => {
    try {
      const data = await s3.listObjectsV2({ Bucket: process.env.LFW_SLS_BUCKET, Prefix: 'fwfidata/ENT_7005/fwis-' }).promise()
      if (data.Contents && data.Contents.length > 0) {
        const key = data.Contents[0].Key
        payload.Records[0].s3.object.key = key
        await lambda.invoke({
          FunctionName: `${process.env.LFW_SLS_BUCKET}-fwisProcess`,
          InvocationType: 'RequestResponse',
          Payload: JSON.stringify(payload)
        }).promise()
      } else {
        throw new Error('No Fwis file found')
      }
    } catch (err) {
      throw err
    }
  })
})
