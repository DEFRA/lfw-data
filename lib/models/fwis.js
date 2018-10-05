const moment = require('moment-timezone')
const sql = require('sql')
const fwisColumns = require('./fwis.json')
const queries = require('../queries')

class Fwis {
  constructor (db) {
    this.db = db
  }

  async save (fwis, timestamp) {
    let warnings = []

    if (fwis.warningreport.warning && fwis.warningreport.warning.length > 0) {
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
          time_raised: moment.tz(warningReport.$.timeraised, 'DD MM YYYY HH mm', 'Europe/London').toJSON(), // Note: fwis.xml supplies datetimes in locale format (Europe/London), with no utc offset
          severity_changed: moment.tz(warningReport.$.severity_changed, 'DD MM YYYY HH mm', 'Europe/London').toJSON(),
          rim_changed: moment.tz(warningReport.$.rim_changed, 'DD MM YYYY HH mm', 'Europe/London').toJSON(),
          rim: warningReport.rim_english[0]
        }
        warnings.push(warning)
      })
    }

    const fwisTable = sql.define({
      name: 'current_fwis',
      columns: fwisColumns
    })

    await this.db.query(queries.deleteCurrentFwis)
    await this.db.query(fwisTable.insert(warnings).toQuery())
    await this.db.query(queries.refreshFloodWarningsMview)
    await this.db.query(queries.updateTimestamp, [timestamp])
  }
}

module.exports = Fwis
