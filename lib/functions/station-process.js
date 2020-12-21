const { Client } = require('pg')
const retry = require('async-retry')
const s3 = require('../helpers/s3')
const util = require('../helpers/util')
const station = require('../models/station')

module.exports.handler = async (event) => {
  console.log('Received new event: ' + JSON.stringify(event))
  const bucket = event.Records[0].s3.bucket.name
  const key = event.Records[0].s3.object.key

  const data = await s3.getObject({ Bucket: bucket, Key: key })

  const stations = await util.parseCsv(data.Body.toString())

  // retry wrapper for client connection
  let client
  await retry(async () => {
    client = new Client({ connectionString: process.env.LFW_DATA_DB_CONNECTION })
    await client.connect()
  }, {
    retries: 2,
    factor: 2,
    minTimeout: 2000,
    onRetry: async (err, attempt) => {
      try {
        await client.end()
      } catch (e) {
        console.error(e)
      }
      console.error(`client connect failed (${attempt})`)
      console.error(err)
    }
  })
  await station.saveToDb(stations, client)
  // TODO there is a minor bug here that has a very low impact on front end
  // When deleting a station from the context file it is removed from the sharepoint site and database
  // Or when changing a station's telemetry ID
  // but the object is not removed from S3 which can cause some rarely seen funny behaviour
  await station.saveToObjects(stations, bucket, s3)
  await client.end()
}
