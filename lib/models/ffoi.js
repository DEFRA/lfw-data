module.exports = {
  save (file, bucket, key, s3) {
    const promises = file.EATimeSeriesDataExchangeFormat.Station
      .filter(item => item.SetofValues[0].$.parameter === 'Water Level')
      .map(item => {
        // set the originating filename and the forecast created date
        item.$.key = key
        item.$.date = file.EATimeSeriesDataExchangeFormat['md:Date'][0]
        item.$.time = file.EATimeSeriesDataExchangeFormat['md:Time'][0]
        const params = {
          Body: JSON.stringify(item),
          Bucket: bucket,
          Key: `ffoi/${item.$.stationReference}.json`
        }

        // filter out past data
        const futureValues = item.SetofValues[0].Value.filter(val => {
          return (new Date(val.$.date + 'T' + val.$.time + 'Z') > new Date())
        })

        if (futureValues === undefined || futureValues.length === 0) {
          return null
        }

        return [
          s3.putObject(params).then(() => {
            // if (process.env.stage !== 'ea') {
            //   console.log('Uploaded ' + params.Key)
            // }
          }).catch((err) => {
            console.log('Failed to upload: ' + params.Key)
            console.error(err)
          })
        ]
      })

    // TODO: technical debt, map above should return an array that we can put straight into Promise.all, this is a fudge due to bug found.
    const promisesClean = []
    promises.forEach(promiseArr => {
      if (promiseArr) {
        promiseArr.forEach(promise => {
          promisesClean.push(promise)
        })
      }
    })

    return Promise.all(promisesClean).then(() => console.log(`File ${key} processed`))
  }
}
