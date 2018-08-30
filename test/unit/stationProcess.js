// 'use strict'

// const Lab = require('lab')
// const lab = exports.lab = Lab.script()
// const fs = require('fs')
// const handler = require('../../lib/functions/stationProcess').handler
// let s3 = require('../../lib/helpers/s3')
// const event = require('../events/rloiStationEvent.json')
// const file = {
//   Body: fs.readFileSync('./test/data/rloiStationData.csv')
// }

// lab.experiment('RLOI Station processing', () => {
//   lab.before(async () => {
//     s3.getObject = (params) => {
//       return new Promise((resolve) => {
//         resolve(file)
//       })
//     }

//     s3.putObject = (params) => {
//       return new Promise((resolve) => {
//         resolve({ ETag: '"47f693afd590c0b546bc052f6cfb4b71"' })
//       })
//     }
//   })

//   lab.test('RLOI Station process', async () => {
//     try {
//       await handler(event)
//     } catch (err) {
//       throw err
//     }
//   })
// })
