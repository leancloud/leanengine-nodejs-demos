var AV = require('leanengine')

const {redisClient} = require('../redis')

AV.Cloud.define('_clientOnline', async (request) => {
  redisClient.set(redisKey(request.params.peerId), true)
})

AV.Cloud.define('_clientOffline', async (request) => {
  redisClient.set(redisKey(request.params.peerId), false)
})

AV.Cloud.define('getOnOffStatus', async (request) => {
  return redisClient.mget(request.params.peerIds.map(redisKey))
})

function redisKey(key) {
  return `onOffStatus:${key}`
}
