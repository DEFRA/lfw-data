const { Client } = require('pg')
const retry = require('async-retry')
const station = require('../models/station')
const rloi = require('../models/rloi')

module.exports.handler = async () => {
  // retry wrapper for client connection
  let client
  await retry(async () => {
    client = new Client({ connectionString: process.env.LFW_DATA_DB_CONNECTION })
    await client.connect()
  }, {
    retries: 2,
    factor: 2,
    minTimeout: 2000,
    onRetry: async (err, attempt) => {
      try {
        await client.end()
      } catch (e) {
        console.error(e)
      }
      console.error(`client connect failed (${attempt})`)
      console.error(err)
    }
  })
  await rloi.deleteOld(client)
  await station.refreshStationMview(client)
  await client.end()
}
