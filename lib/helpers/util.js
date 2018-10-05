const xml2js = require('xml2js')
const csv = require('csvtojson')

class Util {
  toFixed (value, dp) {
    if (value) {
      return Number(Math.round(value + 'e' + dp) + 'e-' + dp).toFixed(dp)
    } else {
      return value
    }
  }

  isNumeric (n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
  }

  parseFloatNull (val) {
    return isNaN(parseFloat(val)) ? null : parseFloat(val)
  }

  parseIntNull (val, radix) {
    return isNaN(parseInt(val, radix)) ? null : parseInt(val, radix)
  }

  parseXml (body) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(body, (err, value) => {
        if (err) {
          reject(err)
        }
        resolve(value)
      })
    })
  }

  parseCsv (string) {
    return new Promise((resolve, reject) => {
      csv()
        .fromString(string)
        .then((csvRow) => {
          resolve(csvRow)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
}

module.exports = Util
