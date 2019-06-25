const AV = require('leanengine')

const {redisClient, createClient} = require('../redis')

/*
 * 使用 Redis Pub/Sub 收发消息
 *
 * 在这个例子中，我们订阅 messages 频道，将收到的消息打印出来，
 * 同时我们还提供了一个用于在 messages 频道上发消息的云函数。
 *
 */

/* Redis 的 subscribe 是阻塞的，所以我们需要新建一个连接 */
const redisSubscriber = createClient()

redisSubscriber.subscribe('messages')

/* 将订阅到的消息打印出来 */
redisSubscriber.on('messages', (channel, message) => {
  console.log('received message', channel, JSON.parse(message))
})

AV.Cloud.define('publishMessage', async request => {
  return redisClient.publish('messages', JSON.stringify(request.params))
})
