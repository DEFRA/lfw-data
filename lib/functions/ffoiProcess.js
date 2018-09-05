const xml2js = require('xml2js')
const s3 = require('../helpers/s3')

module.exports.handler = async (event) => {
  try {
    console.log('Received new event: ' + JSON.stringify(event))
    const bucket = event.Records[0].s3.bucket.name
    const key = event.Records[0].s3.object.key
    const data = await s3.getObject({Bucket: bucket, Key: key})

    // xml2js doesn't support promises so wrap in promise
    const value = await new Promise((resolve, reject) => {
      xml2js.parseString(data.Body, (err, value) => {
        if (err) {
          reject(err)
        }
        resolve(value)
      })
    })

    let count = value.EATimeSeriesDataExchangeFormat.Station.length

    return await new Promise((resolve, reject) => {
      value.EATimeSeriesDataExchangeFormat.Station.forEach((item) => {
        if (item.SetofValues[0].$.parameter === 'Water Level') { // TODO: Made assumption here that only 1 set of values per forecast (not the same in RLOI)
          // set the originating filename and the forecast created date
          item.$.key = key
          item.$.date = value.EATimeSeriesDataExchangeFormat['md:Date'][0]
          item.$.time = value.EATimeSeriesDataExchangeFormat['md:Time'][0]
          let params = {
            Body: JSON.stringify(item),
            Bucket: bucket,
            Key: 'ffoi/' + item.$.stationReference + '.json'
          }
          s3.putObject(params).then((data) => {
            if (process.env.stage !== 'ea') {
              console.log('Uploaded (' + (parseInt(value.EATimeSeriesDataExchangeFormat.Station.length, 10) - count + 1) + '/' + value.EATimeSeriesDataExchangeFormat.Station.length + '): ' + params.Key)
            }
            count--
            if (count === 0) {
              console.log('Processed: ' + event.Records[0].s3.object.key)
              resolve()
            }
          }).catch((err) => {
            count--
            console.log('Failed to upload (' + (parseInt(value.EATimeSeriesDataExchangeFormat.Station.length, 10) - count + 1) + '/' + value.EATimeSeriesDataExchangeFormat.Station.length + '): ' + params.Key)
            console.error(err)
            if (count === 0) {
              console.log('Processed: ' + event.Records[0].s3.object.key)
              resolve()
            }
          })
        } else {
          count--
          if (count === 0) {
            console.log('Processed: ' + event.Records[0].s3.object.key)
            resolve()
          }
        }
      })
    })
  } catch (err) {
    throw err
  }
}
