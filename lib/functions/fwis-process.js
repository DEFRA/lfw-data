const { Client } = require('pg')
const retry = require('async-retry')
const fwis = require('../models/fwis')
const wreck = require('../helpers/wreck')

module.exports.handler = async (event) => {
  // Get Warnings from the FWIS api
  const { warnings } = await wreck.request('get', process.env.LFW_DATA_FWIS_API_URL, {
    json: true,
    headers: {
      'x-api-key': process.env.LFW_DATA_FWIS_API_KEY
    },
    timeout: 30000
  }, true)
  // Get the current seconds since epoch
  const timestamp = Math.round((new Date()).getTime() / 1000)

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
  await fwis.save(warnings, timestamp, client)
  await client.end()
}
