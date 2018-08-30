'use strict'

console.log('Loading rloi station process function')

const s3 = require('../helpers/s3')
const csv = require('csvtojson')

module.exports.handler = async (event) => {
  try {
    console.log('Received new event: ' + JSON.stringify(event))
    const bucket = event.Records[0].s3.bucket.name
    const key = event.Records[0].s3.object.key
    const data = await s3.getObject({ Bucket: bucket, Key: key })

    const stations = await new Promise((resolve, reject) => {
      csv()
        .fromString(data.Body.toString())
        .then((csvRow) => {
          resolve(csvRow)
        })
    })

    // Upload stations as a whole file
    let params = {
      Body: JSON.stringify(stations),
      Bucket: bucket,
      Key: 'rloi/stations.json'
    }

    await s3.putObject(params).then(() => {
      console.log('rloi/stations.json uploaded')
    })

    const count = stations.length
    let uploaded = 0

    console.log(count + ' stations to load')

    return await new Promise((resolve, reject) => {
      stations.forEach((station) => {
        let params = {
          Body: JSON.stringify(station),
          Bucket: bucket,
          Key: 'rloi/' + station.Region + '/' + station.Telemetry_ID + '/station.json'
        }

        s3.putObject(params).then(() => {
          uploaded++
          if (process.env.stage !== 'ea') {
            console.log('Uploaded(' + uploaded + '/' + count + '): ' + params.Key)
          }
          if (uploaded === count) {
            console.log('Stations processed')
            resolve()
          }
        }).catch((err) => {
          uploaded++
          console.log('Failed to upload(' + uploaded + '/' + count + '):' + params.Key)
          console.error(err)
          if (uploaded === count) {
            console.log('Stations processed')
            resolve()
          }
        })
      })
    })
  } catch (err) {
    throw err
  }
}
