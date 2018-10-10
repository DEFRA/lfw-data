class Ffoi {
  constructor (s3) {
    this.s3 = s3
  }
  save (file, bucket, key) {
    const promises = file.EATimeSeriesDataExchangeFormat.Station
      .filter(item => item.SetofValues[0].$.parameter === 'Water Level')
      .map(item => {
        // set the originating filename and the forecast created date
        item.$.key = key
        item.$.date = file.EATimeSeriesDataExchangeFormat['md:Date'][0]
        item.$.time = file.EATimeSeriesDataExchangeFormat['md:Time'][0]
        let params = {
          Body: JSON.stringify(item),
          Bucket: bucket,
          Key: `ffoi/${item.$.stationReference}.json`
        }
        return this.s3.putObject(params).then(() => {
          if (process.env.stage !== 'ea') {
            console.log('Uploaded ' + params.Key)
          }
        }).catch((err) => {
          console.log('Failed to upload: ' + params.Key)
          console.error(err)
        })
      })

    return Promise.all(promises).then(() => console.log(`File ${key} processed`))
  }
}

module.exports = Ffoi
