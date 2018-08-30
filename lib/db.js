'use strict'

const { Pool } = require('pg')

let pool

function init () {
  if (!pool || pool.ending) {
    pool = new Pool({
      connectionString: process.env.FFOI_DB_CONNECTION
    })
  }
}

module.exports = {
  init: () => {
    if (!pool || pool.ending) {
      pool = new Pool({
        connectionString: process.env.FFOI_DB_CONNECTION
      })
    }
  },
  end: () => {
    if (pool && !pool.ending) {
      return pool.end(() => {
        console.log('pool ended')
      })
    }
  },
  query: (query, vars) => {
    init()
    return pool.query(query, vars)
  }
}
