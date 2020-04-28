const sql = require('sql')
const fwisColumns = require('./fwis.json')
const queries = require('../queries')

class Fwis {
  constructor (db) {
    this.db = db
  }

  async save (warnings, timestamp) {
    const dbWarnings = warnings.map(warning => {
      return {
        situation: warning.situation,
        ta_id: warning.attr.taId,
        ta_code: warning.attr.taCode,
        ta_name: warning.attr.taName,
        ta_description: warning.attr.taDescription,
        quick_dial: warning.attr.quickDial,
        ta_version: warning.attr.version,
        ta_category: warning.attr.taCategory,
        owner_area: warning.attr.ownerArea,
        ta_created_date: warning.attr.createdDate,
        ta_modified_date: warning.attr.lastModifiedDate,
        situation_changed: warning.attr.situationChanged,
        severity_changed: warning.attr.severityChanged,
        message_received: warning.attr.timeMessageReceived,
        severity_value: warning.attr.severityValue,
        severity: warning.attr.severity
      }
    })

    const fwisTable = sql.define({
      name: 'fwis',
      columns: fwisColumns
    })
    console.time('delete current fwis')
    await this.db.query(queries.deleteCurrentFwis)
    console.timeEnd('delete current fwis')
    console.time('insert warnings')
    await this.db.query(fwisTable.insert(dbWarnings).toQuery())
    console.timeEnd('insert warnings')
    console.time('refresh mview')
    await this.db.query(queries.refreshFloodWarningsMview)
    console.timeEnd('refresh mview')
    console.time('update timestamp')
    await this.db.query(queries.updateTimestamp, [timestamp])
    console.timeEnd('refresh mview')
  }
}

module.exports = Fwis
