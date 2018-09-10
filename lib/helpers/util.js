module.exports = {
  toFixed: (value, dp) => {
    if (value) {
      return Number(Math.round(value + 'e' + dp) + 'e-' + dp).toFixed(dp)
    } else {
      return value
    }
  },
  isNumeric: n => {
    return !isNaN(parseFloat(n)) && isFinite(n)
  },
  parseFloatNull: val => {
    return isNaN(parseFloat(val)) ? null : parseFloat(val)
  },
  parseIntNull: (val, radix) => {
    return isNaN(parseInt(val, radix)) ? null : parseInt(val, radix)
  }
}
