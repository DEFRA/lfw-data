// 'use strict'

// const Lab = require('lab')
// const lab = exports.lab = Lab.script()
// const fs = require('fs')
// const handler = require('../../lib/functions/ffoiProcess').handler
// let s3 = require('../../lib/s3')
// const event = require('../events/event.json')
// const xml = fs.readFileSync('./test/data/ffoiTest.XML')
// let file = {
//   Body: xml
// }

// lab.experiment('FFOI processing', () => {
//   lab.before(async () => {
//     s3.getObject = (params) => {
//       return new Promise((resolve, reject) => {
//         resolve(file)
//       })
//     }

//     s3.putObject = (params) => {
//       return new Promise((resolve, reject) => {
//         resolve({ ETag: '"47f693afd590c0b546bc052f6cfb4b71"' })
//       })
//     }
//   })

//   lab.test('FFOI process', async () => {
//     try {
//       await handler(event)
//     } catch (err) {
//       throw err
//     }
//   })
// })
