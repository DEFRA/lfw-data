const db = new (require('../helpers/db'))()
const s3 = new (require('../helpers/s3'))()
const util = new (require('../helpers/util'))()
const rloi = new (require('../models/rloi'))(db, s3, util)

module.exports.handler = async (event) => {
  try {
    console.log('Received new event: ' + JSON.stringify(event))
    const bucket = event.Records[0].s3.bucket.name
    const key = event.Records[0].s3.object.key
    const data = await s3.getObject({ Bucket: bucket, Key: key })

    const file = await util.parseXml(data.Body)

    await rloi.save(file, bucket, key)
  } catch (err) {
    throw err
  }
}
