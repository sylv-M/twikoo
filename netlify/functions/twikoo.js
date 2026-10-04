const twikoo = require('twikoo-vercel')

exports.handler = async (event, context) => {
  const defaultHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400'
  }

  // 1. 拦截预检 OPTIONS 请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: ''
    }
  }

  // 2. 构造 Express 风格的 req / res 适配器
  return new Promise((resolve) => {
    let bodyData = event.body
    if (event.isBase64Encoded) {
      bodyData = Buffer.from(event.body, 'base64').toString('utf-8')
    }
    try {
      if (typeof bodyData === 'string' && bodyData.startsWith('{')) {
        bodyData = JSON.parse(bodyData)
      }
    } catch (e) {}

    const req = {
      method: event.httpMethod,
      headers: event.headers,
      query: event.queryStringParameters || {},
      body: bodyData,
      url: event.path
    }

    const res = {
      statusCode: 200,
      headers: { ...defaultHeaders, 'Content-Type': 'application/json' },
      status(code) {
        this.statusCode = code
        return this
      },
      setHeader(key, value) {
        this.headers[key] = value
        return this
      },
      json(data) {
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: JSON.stringify(data)
        })
      },
      send(data) {
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: typeof data === 'object' ? JSON.stringify(data) : String(data)
        })
      },
      end(data) {
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: data ? String(data) : ''
        })
      }
    }

    // 调用 twikoo 逻辑
    try {
      const result = twikoo(req, res)
      if (result && typeof result.then === 'function') {
        result.catch((err) => {
          resolve({
            statusCode: 500,
            headers: defaultHeaders,
            body: JSON.stringify({ error: err.message || String(err) })
          })
        })
      }
    } catch (err) {
      resolve({
        statusCode: 500,
        headers: defaultHeaders,
        body: JSON.stringify({ error: err.message || String(err) })
      })
    }
  })
}
