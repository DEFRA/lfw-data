const sql = require('sql')
const fwisColumns = require('./fwis.json')
const queries = require('../queries')

module.exports = {
  async save (warnings, timestamp, client) {
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

    await client.query(queries.deleteCurrentFwis)
    await client.query(fwisTable.insert(dbWarnings).toQuery())
    await client.query(queries.refreshFloodWarningsMview)
    await client.query(queries.updateTimestamp, [timestamp])
  }
}
