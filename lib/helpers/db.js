'use strict'

const { Pool } = require('pg')

let pool

console.log(process.env.LFW_DB_CONNECTION)

function init () {
  if (!pool || pool.ending) {
    pool = new Pool({
      connectionString: process.env.LFW_DB_CONNECTION
    })
  }
}

module.exports = {
  init: () => {
    if (!pool || pool.ending) {
      pool = new Pool({
        connectionString: process.env.LFW_DB_CONNECTION
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
