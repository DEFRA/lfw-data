'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const handler = require('../../lib/functions/rloiRefresh').handler
let db = require('../../lib/helpers/db')
const event = require('../events/fwisEvent.json')

lab.experiment('rloi Refresh', () => {
  lab.beforeEach(async () => {
    // Mock database call
    db.query = (query, vars) => {
      return new Promise((resolve, reject) => {
        resolve({})
      })
    }
  })

  lab.test('rloi Refresh', async () => {
    try {
      await handler(event)
    } catch (err) {
      throw err
    }
  })
})
