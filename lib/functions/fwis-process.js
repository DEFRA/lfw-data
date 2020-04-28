const db = new (require('../helpers/db'))()
const fwis = new (require('../models/fwis'))(db)
const wreck = require('../helpers/wreck')

module.exports.handler = async (event) => {
  // Get Warnings from the FWIS api
  console.time('fws-api hit time')
  const { warnings } = await wreck.request('get', process.env.LFW_DATA_FWIS_API_URL, {
    json: true,
    headers: {
      'x-api-key': process.env.LFW_DATA_FWIS_API_KEY
    },
    timeout: 45000 // TODO, this 45sec timeout is for testing purposes.
  }, true)
  console.timeEnd('fws-api hit time')
  // Get the current seconds since epoch
  const timestamp = Math.round((new Date()).getTime() / 1000)
  console.time('fwis save')
  await fwis.save(warnings, timestamp)
  console.timeEnd('fwis save')
  console.time('db.end')
  await db.end()
  console.timeEnd('db.end')
}
