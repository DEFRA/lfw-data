const { Pool } = require('pg')

let pool

class Db {
  constructor () {
    this.init()
  }

  init () {
    if (!pool || pool.ending) {
      pool = new Pool({
        connectionString: process.env.LFW_DB_CONNECTION
      })
    }
  }

  query (query, vars) {
    this.init()
    return pool.query(query, vars)
  }
}

module.exports = Db
