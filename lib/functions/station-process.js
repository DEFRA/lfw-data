const { Client } = require('pg')
const s3 = require('../helpers/s3')
const util = require('../helpers/util')
const station = require('../models/station')

module.exports.handler = async (event) => {
  console.log('Received new event: ' + JSON.stringify(event))
  const bucket = event.Records[0].s3.bucket.name
  const key = event.Records[0].s3.object.key

  const data = await s3.getObject({ Bucket: bucket, Key: key })

  const stations = await util.parseCsv(data.Body.toString())

  const client = new Client({
    connectionString: process.env.LFW_DATA_DB_CONNECTION
  })
  await client.connect()
  await station.saveToDb(stations, client)
  await station.saveToObjects(stations, bucket, s3)
  await client.end()
}
