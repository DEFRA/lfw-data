const { Pool } = require('pg')
const s3 = require('../helpers/s3')
const util = require('../helpers/util')
const rloi = require('../models/rloi')

module.exports.handler = async (event) => {
  console.log('Received new event: ' + JSON.stringify(event))
  const bucket = event.Records[0].s3.bucket.name
  const key = event.Records[0].s3.object.key
  const data = await s3.getObject({ Bucket: bucket, Key: key })

  const file = await util.parseXml(data.Body)

  // use pool and not client due to multiple database queries
  const pool = new Pool({ connectionString: process.env.LFW_DATA_DB_CONNECTION })
  await rloi.save(file, bucket, key, pool, s3)
  await pool.end()
}
