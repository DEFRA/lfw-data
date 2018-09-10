const xml2js = require('xml2js')
const s3 = require('../helpers/s3')
const db = require('../helpers/db')
const sql = require('sql')
sql.setDialect('postgres')
const util = require('../helpers/util')
const regions = require('../models/regions.json')
const queries = require('../queries')
const slsTelemetryValue = require('../models/sls_telemetry_value.json')

function isNumeric (n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

module.exports.handler = async (event) => {
  try {
    console.log('Received new event: ' + JSON.stringify(event))
    const bucket = event.Records[0].s3.bucket.name
    const key = event.Records[0].s3.object.key
    const data = await s3.getObject({ Bucket: bucket, Key: key })

    // xml2js doesn't support promises so wrap in promise
    const value = await new Promise((resolve, reject) => {
      xml2js.parseString(data.Body, (err, value) => {
        if (err) {
          reject(err)
        }
        resolve(value)
      })
    })

    let totalFiles = 0
    let processed = 0

    for (let i = 0; i < value.EATimeSeriesDataExchangeFormat.Station.length; i++) {
      for (let ii = 0; ii < value.EATimeSeriesDataExchangeFormat.Station[i].SetofValues.length; ii++) {
        totalFiles++
      }
    }

    console.log(totalFiles + ' files to process')

    return await new Promise((resolve) => {
      value.EATimeSeriesDataExchangeFormat.Station.forEach((item) => {
        // Update region to match station region as telemetry file region slightly differs, so keep consistent with station data
        item.$.telemetryRegion = item.$.region
        item.$.region = regions[item.$.region] ? regions[item.$.region] : item.$.region

        item.SetofValues.forEach(async (setOfValues) => {
          let station
          try {
            station = await s3.getObject({ Bucket: bucket, Key: `rloi/${item.$.region}/${item.$.stationReference}/station.json` })
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
              parseFloat(station.Subtract, 10),
              parseFloat(station.POR_Max_Value, 10),
              station.Station_Type,
              parseFloat(station.percentile_5, 10)
            ]

            let res = await db.query(parentQuery, parent)
            let values = []
            console.log(`Loaded parent: ${station.RLOI_ID} | ${setOfValues.$.parameter} | ${setOfValues.$.qualifier}`)

            // Process values and store in new file
            for (let i = 0; i < setOfValues.Value.length; i++) {
              values[i] = {
                telemetry_value_parent_id: res.rows[0].telemetry_value_parent_id,
                value: parseFloat(setOfValues.Value[i]._, 10),
                processed_value: parseFloat(setOfValues.Value[i]._, 10),
                value_timestamp: (new Date(`${setOfValues.Value[i].$.date}T${setOfValues.Value[i].$.time}Z`)).toJSON(),
                error: false
              }
              // Process values if they're Water Level
              if (setOfValues.$.parameter === 'Water Level') {
                // Subtract value if post process required
                if (station.Post_Process.toLowerCase() === 'y' || station.Post_Process.toLowerCase() === 'yes') {
                  values[i].processed_value = station.Subtract ? parseFloat(util.toFixed(values[i].value - parseFloat(station.Subtract, 10), 3), 10) : values[i].value
                }
                // Set error flag if no data or negative when not a coastal station
                if ((!isNumeric(values[i].processed_value)) || (station.Station_Type !== 'C' && values[i].processed_value < 0)) {
                  values[i].processed_value = null
                  values[i].error = true
                }
              }
            }

            const valuesTable = sql.define({
              name: 'sls_telemetry_value',
              columns: slsTelemetryValue
            })

            await db.query(valuesTable.insert(values).toQuery())
            console.log(`Loaded station values: ${station.RLOI_ID} | ${setOfValues.$.parameter} | ${setOfValues.$.qualifier}`)
          }
          processed++
          if (processed === totalFiles) {
            console.log('all values processed')
            await db.end()
            resolve()
          }
        })
      })
    })
  } catch (err) {
    throw err
  }
}
