const db = new (require('../helpers/db'))()
const s3 = new (require('../helpers/s3'))()
const fwis = new (require('../models/fwis'))(db)
const util = new (require('../helpers/util'))()

module.exports.handler = async (event) => {
  try {
    console.log('Received new event: ' + JSON.stringify(event))
    const bucket = event.Records[0].s3.bucket.name
    const key = event.Records[0].s3.object.key
    const data = await s3.getObject({ Bucket: bucket, Key: key })

    const timestamp = key.substring(key.indexOf('/fwis-') + 6, key.indexOf('.xml'))

    const file = await util.parseXml(data.Body)

    await fwis.save(file, timestamp)
  } catch (err) {
    throw err
  }
}
