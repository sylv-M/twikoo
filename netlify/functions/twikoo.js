const twikoo = require('twikoo-vercel')

exports.handler = async function (event, context) {
  return await twikoo({
    event,
    context,
    envId: process.env.MONGODB_URI
  })
}
