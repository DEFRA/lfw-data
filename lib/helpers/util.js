module.exports = {
  toFixed: (value, dp) => {
    if (value) {
      return Number(Math.round(value + 'e' + dp) + 'e-' + dp).toFixed(dp)
    } else {
      return value
    }
  }
}
