const db = new (require('../helpers/db'))()
const fwis = new (require('../models/fwis'))(db)
const wreck = require('../helpers/wreck')

module.exports.handler = async (event) => {
  // Get Warnings from the FWIS api
  const { warnings } = await wreck.request('get', 'https://prdfws-agw.prd.defra.cloud/fwis.json', {
    json: true,
    headers: {
      'x-api-key': process.env.LFW_FWIS_API_KEY
    }
  }, true)

  // Get the current seconds since epoch
  const timestamp = Math.round((new Date()).getTime() / 1000)

  await fwis.save(warnings, timestamp)
  await db.end()
}
