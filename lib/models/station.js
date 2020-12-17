const sql = require('sql')
const moment = require('moment')
const stationColumns = require('./station.json')
const queries = require('../queries')
const util = require('../helpers/util')

module.exports = {
  async saveToObjects (stations, bucket, s3) {
    const params = {
      Body: JSON.stringify(stations),
      Bucket: bucket,
      Key: 'rloi/stations.json'
    }
    await s3.putObject(params).then(() => {
      console.log(`${params.Key} uploaded`)
      const count = stations.length
      let uploaded = 0

      console.log(count + ' stations to load')

      return new Promise((resolve) => {
        stations.forEach(station => {
          const params = {
            Body: JSON.stringify(station),
            Bucket: bucket,
            Key: `rloi/${station.Region}/${station.Telemetry_ID}/station.json`
          }

          s3.putObject(params).then(() => {
            uploaded++
            // if (process.env.stage !== 'ea') {
            //   console.log(`Uploaded(${uploaded}/${count}): ${params.Key}`)
            // }
            if (uploaded === count) {
              console.log('Stations processed')
              resolve()
            }
          }).catch((err) => {
            uploaded++
            console.log(`Failed to upload(${uploaded}/${count}): ${params.Key}`)
            console.error(err)
            if (uploaded === count) {
              console.log('Stations processed')
              resolve()
            }
          })
        })
      })
    })
  },

  async saveToDb (stations, client) {
    const stationTable = sql.define({
      name: 'telemetry_context',
      columns: stationColumns
    })

    const dbStations = []

    // Need to loop stations and ensure values are good
    stations.forEach(station => {
      dbStations.push({
        telemetry_id: station.Telemetry_ID,
        wiski_id: station.WISKI_ID,
        rloi_id: util.parseIntNull(station.RLOI_ID, 10),
        station_type: station.Station_Type,
        post_process: station.Post_Process,
        subtract: util.parseFloatNull(station.Subtract),
        region: station.Region,
        area: station.Area,
        catchment: station.Catchment,
        display_region: station.Display_Region,
        display_area: station.Display_Area,
        display_catchment: station.Display_Catchment,
        agency_name: station.Agency_Name,
        external_name: station.External_Name,
        location_info: station.Location_Info,
        x_coord_actual: util.parseIntNull(station.X_coord_Actual, 10),
        y_coord_actual: util.parseIntNull(station.Y_Coord_Actual, 10),
        actual_ngr: station.Actual_NGR,
        x_coord_display: util.parseIntNull(station.X_coord_Display, 10),
        y_coord_display: util.parseIntNull(station.Y_coord_Display, 10),
        site_max: util.parseFloatNull(station.Site_Max),
        wiski_river_name: station.Wiski_River_Name,
        date_open: station.Date_Open ? moment.utc(station.Date_Open, 'DD/MM/YYYY HH:mm').format() : null,
        stage_datum: util.parseFloatNull(station.Stage_Datum),
        period_of_record: station.Period_of_Record,
        por_max_value: util.parseFloatNull(station.POR_Max_Value),
        date_por_max: station.Date_POR_Max ? moment.utc(station.Date_POR_Max, 'DD/MM/YYYY HH:mm').format() : null,
        highest_level: util.parseFloatNull(station.Highest_Level),
        date_highest_level: station.Date_Highest_Level ? moment.utc(station.Date_Highest_Level, 'DD/MM/YYYY HH:mm').format() : null,
        por_min_value: util.parseFloatNull(station.POR_Min_Value),
        date_por_min: station.Date_POR_Min ? moment.utc(station.Date_POR_Min, 'DD/MM/YYYY HH:mm').format() : null,
        percentile_5: util.parseFloatNull(station.percentile_5),
        percentile_95: util.parseFloatNull(station.percentile_95),
        comments: station.Comments,
        d_stage_datum: util.parseFloatNull(station.D_Stage_Datum),
        d_period_of_record: station.D_Period_of_Record,
        d_por_max_value: util.parseFloatNull(station.D_POR_Max_Value),
        d_date_por_max: station.D_Date_POR_Max ? moment.utc(station.D_Date_POR_Max, 'DD/MM/YYYY HH:mm').format() : null,
        d_highest_level: util.parseFloatNull(station.D_Highest_Level),
        d_date_highest_level: station.D_Date_Highest_Level ? moment.utc(station.D_Date_Highest_Level, 'DD/MM/YYYY HH:mm').format() : null,
        d_por_min_value: util.parseFloatNull(station.D_POR_Min_Value),
        d_date_por_min: station.D_Date_POR_Min ? moment.utc(station.D_Date_POR_Min, 'DD/MM/YYYY HH:mm').format() : null,
        d_percentile_5: util.parseFloatNull(station.D_percentile_5),
        d_percentile_95: util.parseFloatNull(station.D_percentile_95),
        d_comments: station.D_Comments,
        status: station.Status,
        status_reason: station.Status_Reason,
        status_date: station.Status_Date ? moment.utc(station.Status_Date, 'DD/MM/YYYY HH:mm').format() : null
      })
    })

    // Clear out stations
    await client.query(queries.deleteStations)

    // batch up the database inserts as struggles with > 1500 records
    const stationsFactor = Math.floor(dbStations.length / 500)
    for (let i = 0; i <= stationsFactor; i++) {
      await client.query(stationTable.insert(dbStations.slice(i * 500, (i * 500) + 500)).toQuery())
    }

    // refresh mviews data
    await this.refreshStationMview(client)
  },

  async refreshStationMview (client) {
    await client.query(queries.refreshStationMviews)
  }
}
