// 'use strict'

// const Lab = require('lab')
// const lab = exports.lab = Lab.script()
// const fs = require('fs')
// const handler = require('../../lib/functions/rloiProcess').handler
// let s3 = require('../../lib/helpers/s3')
// const event = require('../events/rloiEvent.json')
// const xml = fs.readFileSync('./test/data/rloiTest.XML')
// let file = {
//   Body: xml
// }

// lab.experiment('RLOI processing', () => {
//   lab.before(async () => {
//     s3.getObject = (params) => {
//       return new Promise((resolve, reject) => {
//         if (params.Key === event.Records[0].s3.object.key) {
//           resolve(file)
//         } else {
//           reject(new Error())
//         }
//       })
//     }

//     s3.putObject = (params) => {
//       return new Promise((resolve, reject) => {
//         resolve({ ETag: '"47f693afd590c0b546bc052f6cfb4b71"' })
//       })
//     }
//   })

//   lab.test('RLOI process', async () => {
//     try {
//       await handler(event)
//     } catch (err) {
//       throw err
//     }
//   })
// })
