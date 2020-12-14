const { Client } = require('pg')
const station = require('../models/station')
const rloi = require('../models/rloi')

module.exports.handler = async () => {
  const client = new Client({
    connectionString: process.env.LFW_DATA_DB_CONNECTION
  })
  await client.connect()
  await rloi.deleteOld(client)
  await station.refreshStationMview(client)
  await client.end()
}
