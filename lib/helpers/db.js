const ServerlessClient = require('serverless-postgres')

module.exports = new ServerlessClient({
  connectionString: process.env.LFW_DATA_DB_CONNECTION
})
