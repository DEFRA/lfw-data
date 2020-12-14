// const ServerlessClient = require('serverless-postgres')
const { Client } = require('pg')

// module.exports = new ServerlessClient({
//   connectionString: process.env.LFW_DATA_DB_CONNECTION
// })
module.exports = new Client({
  connectionString: process.env.LFW_DATA_DB_CONNECTION
})
