const twikoo = require('twikoo-vercel')

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400'
  }

  // 1. 拦截预检请求（OPTIONS），直接返回 200，杜绝 502 错误
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  // 2. 正常处理 POST/GET 请求
  try {
    const res = await twikoo(event, context)
    return {
      ...res,
      headers: {
        ...headers,
        ...(res && res.headers ? res.headers : {})
      }
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || String(err) })
    }
  }
}
