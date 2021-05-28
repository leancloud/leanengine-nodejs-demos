var AV = require('leanengine')

const {redisClient} = require('../redis')

AV.Cloud.onIMClientOnline(async (request) => {
  // 设置某一客户端 ID 对应的值为 1，表示上线状态，同时清空过期计时
  redisClient.set(redisKey(request.params.peerId), 1)
})

AV.Cloud.onIMClientOffline(async (request) => {
  // 设置某一客户端 ID 对应的值为 0，表示下线状态，同时设置过期计时
  redisClient.set(redisKey(request.params.peerId), 0, 'EX', 604800)
})

AV.Cloud.define('getOnOffStatus', async (request) => {
  // 约定 key: ”peerIds” 对应的值是一组客户端的 ID
  return redisClient.mget(request.params.peerIds.map(redisKey))
})

function redisKey(key) {
  return `onOffStatus:${key}`
}
