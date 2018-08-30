'use strict'

console.log('Loading rloi process function')

const xml2js = require('xml2js')
const s3 = require('../s3')
const db = require('../db')
const sql = require('sql')
sql.setDialect('postgres')
const util = require('../util')
const regions = require('../regions.json')

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
      const finalise = async function () {
        processed++
        if (processed === totalFiles) {
          console.log('all values processed')
          await db.end()
          resolve()
        }
      }
      value.EATimeSeriesDataExchangeFormat.Station.forEach((item) => {
        // Update region to match station region as telemetry file region slightly differs, so keep consistent with station data
        item.$.telemetryRegion = item.$.region
        item.$.region = regions[item.$.region] ? regions[item.$.region] : item.$.region

        item.SetofValues.forEach(async (setOfValues) => {
          try {
            let station = await s3.getObject({ Bucket: bucket, Key: 'rloi/' + item.$.region + '/' + item.$.stationReference + '/station.json' })
            station = JSON.parse(station.Body)
            // Store parent details in sls_telemetry_value_parent
            const parentQuery = 'INSERT INTO sls_telemetry_value_parent(filename, imported, rloi_id, station, region, start_timestamp, end_timestamp, parameter, qualifier, units, post_process, subtract, por_max_value, station_type, percentile_5) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING telemetry_value_parent_id'
            const parent = [
              key,
              new Date(),
              parseInt(station.RLOI_ID),
              station.WISKI_ID,
              station.Region,
              new Date(setOfValues.$.startDate + 'T' + setOfValues.$.startTime + 'Z'),
              new Date(setOfValues.$.endDate + 'T' + setOfValues.$.endTime + 'Z'),
              setOfValues.$.parameter,
              setOfValues.$.qualifier,
              setOfValues.$.units,
              (station.Post_Process.toLowerCase() === 'y' || station.Post_Process.toLowerCase() === 'yes'),
              parseFloat(station.Subtract, 10),
              parseFloat(station.POR_Max_Value, 10),
              station.Station_Type,
              parseFloat(station.percentile_5, 10)
            ]

            let res = await db.query(parentQuery, parent)
            let values = []
            console.log('Loaded parent: ' + station.RLOI_ID + ' | ' + setOfValues.$.parameter + ' | ' + setOfValues.$.qualifier)

            // Process values and store in new file
            for (let i = 0; i < setOfValues.Value.length; i++) {
              values[i] = {
                telemetry_value_parent_id: res.rows[0].telemetry_value_parent_id,
                value: parseFloat(setOfValues.Value[i]._, 10),
                processed_value: parseFloat(setOfValues.Value[i]._, 10),
                value_timestamp: (new Date(setOfValues.Value[i].$.date + 'T' + setOfValues.Value[i].$.time + 'Z')).toJSON(),
                error: false
              }
              // Process values if they're Water Level
              if (setOfValues.$.parameter === 'Water Level') {
                // Subtract value if post process required
                if (station.Post_Process.toLowerCase() === 'y' || station.Post_Process.toLowerCase() === 'yes') {
                  values[i].processed_value = station.Subtract ? parseFloat(util.toFixed(values[i].value - parseFloat(station.Subtract, 10), 3), 10) : values[i].value
                }
                // Set error flag if no data or negative when not a coastal station
                if ((!isNumeric(values[i].value)) || (station.Station_Type !== 'C' && values[i].value < 0)) {
                  values[i].processed_value = null
                  values[i].error = true
                }
              }
            }

            const valuesTable = sql.define({
              name: 'sls_telemetry_value',
              columns: ['telemetry_value_parent_id', 'value', 'processed_value', 'value_timestamp', 'error']
            })

            await db.query(valuesTable.insert(values).toQuery())
            console.log('Loaded station values: ' + station.RLOI_ID + ' | ' + setOfValues.$.parameter + ' | ' + setOfValues.$.qualifier)
            await finalise()
          } catch (err) {
            if (err.message.indexOf('The specified key does not exist.' ) === -1) {
              console.log(err)
            }
            await finalise()
          }
        })
      })
    })
  } catch (err) {
    throw err
  }
}
