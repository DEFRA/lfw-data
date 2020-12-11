const db = require('../helpers/db')
const s3 = require('../helpers/s3')
const util = require('../helpers/util')
const station = new (require('../models/station'))(db, s3, util)

module.exports.handler = async (event) => {
  console.log('Received new event: ' + JSON.stringify(event))
  const bucket = event.Records[0].s3.bucket.name
  const key = event.Records[0].s3.object.key

  const data = await s3.getObject({ Bucket: bucket, Key: key })

  const stations = await util.parseCsv(data.Body.toString())

  await station.saveToDb(stations)
  await station.saveToObjects(stations, bucket)
}
