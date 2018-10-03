const db = require('../helpers/db')
const queries = require('../queries')

module.exports.handler = async () => {
  await db.query(queries.deleteOldTelemetry)
  await db.query(queries.refreshStationMviews)
}
