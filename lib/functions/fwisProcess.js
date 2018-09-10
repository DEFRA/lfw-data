const xml2js = require('xml2js')
const moment = require('moment')
const sql = require('sql')
const s3 = require('../helpers/s3')
const db = require('../helpers/db')
const fwisColumns = require('../models/fwis.json')
const queries = require('../queries')

module.exports.handler = async (event) => {
  try {
    console.log('Received new event: ' + JSON.stringify(event))
    const bucket = event.Records[0].s3.bucket.name
    const key = event.Records[0].s3.object.key
    const data = await s3.getObject({ Bucket: bucket, Key: key })

    const timestamp = key.substring(key.indexOf('/fwis-') + 6, key.indexOf('.xml'))

    const fwis = await new Promise((resolve, reject) => {
      xml2js.parseString(data.Body, (err, value) => {
        if (err) {
          reject(err)
        }
        resolve(value)
      })
    })

    let warnings = []

    // Store data into fwis
    fwis.warningreport.warning.forEach(warningReport => {
      const warning = {
        fwa_code: warningReport.$.fwacode,
        fwa_key: warningReport.$.fwakey,
        description: warningReport.$.description,
        region: warningReport.$.region,
        area: warningReport.$.area,
        tidal: warningReport.$.tidal,
        severity: warningReport.$.severity,
        severity_value: warningReport.$.severityvalue,
        warning_key: warningReport.$.warningkey,
        time_raised: moment.utc(warningReport.$.timeraised, 'DD MM YYYY HH mm').toJSON(),
        severity_changed: moment.utc(warningReport.$.severity_changed, 'DD MM YYYY HH mm').toJSON(),
        rim_changed: moment.utc(warningReport.$.rim_changed, 'DD MM YYYY HH mm').toJSON(),
        rim: warningReport.rim_english[0]
      }
      warnings.push(warning)
    })

    const fwisTable = sql.define({
      name: 'current_fwis',
      columns: fwisColumns
    })

    await db.query(queries.deleteCurrentFwis)
    await db.query(fwisTable.insert(warnings).toQuery())
    await db.query(queries.refreshFloodWarningsMview)
    await db.query(queries.updateTimestamp, [timestamp])
  } catch (err) {
    throw err
  }
}
