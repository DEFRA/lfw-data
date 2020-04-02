const wreck = require('@hapi/wreck').defaults({
  timeout: 20000
})

let wreckExt
// if (config.httpsProxy) {
//   wreckExt = require('@hapi/wreck').defaults({
//     timeout: config.httpTimeoutMs,
//     agent: new HttpsProxyAgent(config.httpsProxy)
//   })
// }

// do we need to go out on the proxy from lfw-data?

module.exports = {
  request: (method, url, options, ext = false) => {
    const thisWreck = (ext && wreckExt) ? wreckExt : wreck
    return thisWreck[method](url, options)
      .then(response => {
        const res = response.res
        const payload = response.payload

        if (res.statusCode !== 200) {
          const err = (payload || new Error('Unknown error'))
          throw err
        }

        return payload
      })
  }
}
