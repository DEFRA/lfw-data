class Ffoi {
  constructor (s3) {
    this.s3 = s3
  }
  save (file, bucket, key) {
    let count = file.EATimeSeriesDataExchangeFormat.Station.length

    return new Promise((resolve, reject) => {
      file.EATimeSeriesDataExchangeFormat.Station.forEach((item) => {
        if (item.SetofValues[0].$.parameter === 'Water Level') { // TODO: Made assumption here that only 1 set of values per forecast (not the same in RLOI)
          // set the originating filename and the forecast created date
          item.$.key = key
          item.$.date = file.EATimeSeriesDataExchangeFormat['md:Date'][0]
          item.$.time = file.EATimeSeriesDataExchangeFormat['md:Time'][0]
          let params = {
            Body: JSON.stringify(item),
            Bucket: bucket,
            Key: `ffoi/${item.$.stationReference}.json`
          }
          this.s3.putObject(params).then((data) => {
            if (process.env.stage !== 'ea') {
              console.log('Uploaded (' + (parseInt(file.EATimeSeriesDataExchangeFormat.Station.length, 10) - count + 1) + '/' + file.EATimeSeriesDataExchangeFormat.Station.length + '): ' + params.Key)
            }
            count--
            if (count === 0) {
              console.log(`Processed: ${key}`)
              resolve()
            }
          }).catch((err) => {
            count--
            console.log('Failed to upload (' + (parseInt(file.EATimeSeriesDataExchangeFormat.Station.length, 10) - count + 1) + '/' + file.EATimeSeriesDataExchangeFormat.Station.length + '): ' + params.Key)
            console.error(err)
            if (count === 0) {
              console.log(`Processed: ${key}`)
              resolve()
            }
          })
        } else {
          count--
          if (count === 0) {
            console.log(`Processed: ${key}`)
            resolve()
          }
        }
      })
    })
  }
}

module.exports = Ffoi
