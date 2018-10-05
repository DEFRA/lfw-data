const sql = require('sql')
sql.setDialect('postgres')
const regions = require('../models/regions.json')
const queries = require('../queries')
const slsTelemetryValue = require('../models/sls_telemetry_value.json')

class Rloi {
  constructor (db, s3, util) {
    this.db = db
    this.s3 = s3
    this.util = util
  }
  save (value, bucket, key) {
    let totalFiles = 0
    let processed = 0

    for (let i = 0; i < value.EATimeSeriesDataExchangeFormat.Station.length; i++) {
      if (value.EATimeSeriesDataExchangeFormat.Station[i].SetofValues) {
        for (let ii = 0; ii < value.EATimeSeriesDataExchangeFormat.Station[i].SetofValues.length; ii++) {
          totalFiles++
        }
      }
    }

    console.log(totalFiles + ' files to process')

    return new Promise((resolve) => {
      value.EATimeSeriesDataExchangeFormat.Station.forEach((item) => {
        if (item.SetofValues) {
          // Update region to match station region as telemetry file region slightly differs, so keep consistent with station data
          item.$.telemetryRegion = item.$.region
          item.$.region = regions[item.$.region] ? regions[item.$.region] : item.$.region

          item.SetofValues.forEach(async (setOfValues) => {
            let station
            try {
              station = await this.s3.getObject({ Bucket: bucket, Key: `rloi/${item.$.region}/${item.$.stationReference}/station.json` })
              station = JSON.parse(station.Body)
            } catch (err) {
            }

            // only process the values if we have a station
            if (station) {
              // Store parent details in sls_telemetry_value_parent
              const parentQuery = queries.sls_telemetry_value_parent
              const parent = [
                key,
                new Date(),
                parseInt(station.RLOI_ID),
                station.WISKI_ID,
                station.Region,
                new Date(`${setOfValues.$.startDate}T${setOfValues.$.startTime}Z`),
                new Date(`${setOfValues.$.endDate}T${setOfValues.$.endTime}Z`),
                setOfValues.$.parameter ? setOfValues.$.parameter : '',
                setOfValues.$.qualifier ? setOfValues.$.qualifier : '',
                setOfValues.$.units ? setOfValues.$.units : '',
                (station.Post_Process.toLowerCase() === 'y' || station.Post_Process.toLowerCase() === 'yes'),
                parseFloat(station.Subtract),
                parseFloat(station.POR_Max_Value),
                station.Station_Type,
                parseFloat(station.percentile_5)
              ]

              let res = await this.db.query(parentQuery, parent)
              let values = []
              console.log(`Loaded parent: ${station.RLOI_ID} | ${setOfValues.$.parameter} | ${setOfValues.$.qualifier}`)

              // Process values and store in new file
              for (let i = 0; i < setOfValues.Value.length; i++) {
                values[i] = {
                  telemetry_value_parent_id: res.rows[0].telemetry_value_parent_id,
                  value: parseFloat(setOfValues.Value[i]._),
                  processed_value: parseFloat(setOfValues.Value[i]._),
                  value_timestamp: (new Date(`${setOfValues.Value[i].$.date}T${setOfValues.Value[i].$.time}Z`)).toJSON(),
                  error: false
                }
                // Process values if they're Water Level
                if (setOfValues.$.parameter === 'Water Level') {
                  // Subtract value if post process required
                  if (station.Post_Process.toLowerCase() === 'y' || station.Post_Process.toLowerCase() === 'yes') {
                    values[i].processed_value = station.Subtract ? parseFloat(this.util.toFixed(values[i].value - parseFloat(station.Subtract), 3)) : values[i].value
                  }
                  // Set error flag if no data or negative when not a coastal station
                  if (!this.util.isNumeric(values[i].processed_value) || (station.Station_Type !== 'C' && values[i].processed_value < 0)) {
                    values[i].processed_value = null
                    values[i].error = true
                  }
                }
              }

              const valuesTable = sql.define({
                name: 'sls_telemetry_value',
                columns: slsTelemetryValue
              })

              await this.db.query(valuesTable.insert(values).toQuery())
              console.log(`Loaded station values: ${station.RLOI_ID} | ${setOfValues.$.parameter} | ${setOfValues.$.qualifier}`)
            }
            processed++
            if (processed === totalFiles) {
              console.log('all values processed')
              resolve()
            }
          })
        }
      })
    })
  }

  async deleteOld () {
    await this.db.query(queries.deleteOldTelemetry)
  }
}

module.exports = Rloi
