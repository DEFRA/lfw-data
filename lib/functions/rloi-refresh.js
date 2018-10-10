const db = new (require('../helpers/db'))()
const station = new (require('../models/station'))(db)
const rloi = new (require('../models/rloi'))(db)

module.exports.handler = async () => {
  try {
    await rloi.deleteOld()
    await station.refreshStationMview()
  } catch (err) {
    throw err
  }
}
