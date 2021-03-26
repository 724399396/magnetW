const axios = require('axios')
const tunnel = require('tunnel')
const SocksProxyAgent = require('socks-proxy-agent')
const HttpsProxyAgent = require('https-proxy-agent')

/**
 * @param appConfig 必填
 * @returns {*}
 */
function create (appConfig) {
  const defaultTimeout = 5000

  const http = axios.create({
    timeout: defaultTimeout
  })
  http.interceptors.request.use(config => {
    let proxyURL
    if (appConfig && appConfig.hasOwnProperty('proxy') && appConfig.hasOwnProperty('proxyType') &&
      appConfig.hasOwnProperty('proxyHost') && appConfig.hasOwnProperty('proxyPort')) {
      const {proxy, proxyType, proxyHost, proxyPort} = appConfig
      if (proxy) {
        proxyURL = `${proxyType}://${proxyHost}:${proxyPort}`
        config.proxy = false
        config.httpsAgent = new HttpsProxyAgent(proxyURL)
      }
    }
    const headers = config.headers
    const customHeaders = {}
    for (let key in headers) {
      if (!/common|delete|get|head|post|put|patch/.test(key)) {
        customHeaders[key] = headers[key]
      }
    }
    console.info({
      url: config.url,
      headers: customHeaders,
      proxy: proxyURL
    })
    return config
  })
  http.interceptors.response.use(rsp => rsp.data, error => Promise.reject(error))
  return http
}

module.exports = create
