const xml2js = require('xml2js')
const csv = require('csvtojson')

module.exports = {
  toFixed (value, dp) {
    if (value) {
      return Number(Math.round(value + 'e' + dp) + 'e-' + dp).toFixed(dp)
    } else {
      return value
    }
  },
  isNumeric (n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
  },
  parseFloatNull (val) {
    return isNaN(parseFloat(val)) ? null : parseFloat(val)
  },
  parseIntNull (val, radix) {
    return isNaN(parseInt(val, radix)) ? null : parseInt(val, radix)
  },
  parseXml (body) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(body, (err, value) => {
        if (err) {
          reject(err)
          return
        }
        resolve(value)
      })
    })
  },
  parseCsv (string) {
    return csv().fromString(string)
  }
}
