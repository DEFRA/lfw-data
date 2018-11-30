const queries = require('../queries')

class Ffoi {
  constructor (s3, db) {
    this.s3 = s3
    this.db = db
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

        // get the max forecast value
        // filter out past data
        // then get highest value
        const max = item.SetofValues[0].Value.filter(val => {
          return (new Date(val.$.date + 'T' + val.$.time + 'Z') > new Date())
        }).reduce((a, b) => {
          return (a._ > b._) ? a : b
        })

        return [
          this.s3.putObject(params).then(() => {
            if (process.env.stage !== 'ea') {
              console.log('Uploaded ' + params.Key)
            }
          }).catch((err) => {
            console.log('Failed to upload: ' + params.Key)
            console.error(err)
          }),
          this.db.query(queries.upsertFfoiMax, [item.$.stationReference, max._, max.$.date + 'T' + max.$.time + 'Z', key, new Date()]).then(() => {
            if (process.env.stage !== 'ea') {
              console.log('FFOI max ' + params.Key + ' added to db')
            }
          }).catch(err => {
            console.error(err)
          })
        ]
      })

    return Promise.all(promises).then(() => console.log(`File ${key} processed`))
  }
}

module.exports = Ffoi
