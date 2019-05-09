const AV = require('leanengine')
const _ = require('lodash')

const {redisClient} = require('../redis')
const RushStock = AV.Object.extend('RushStock')

/*
 * 使用 LeanCache 实现秒杀抢购
 *
 * 在秒杀抢购活动中可能会在短时间内有大量的请求，如果每个请求都需要访问云存储会占用大量的工作线程数，
 * 在这个例子中我们将秒杀活动的信息存到 LeanCache 中，并用 LeanCache 来维护秒杀结果，
 * 一个 LeanCache 实例可以支持 10000 QPS 甚至更多的请求，
 * 在秒杀活动期间不需要访问云存储，在活动结束后再将结果提交至云存储。
 *
 * 安装依赖：
 *
 *   npm install moment lodash
 *
 */

/*
 * 供管理员创建一个秒杀活动
 *
 * quota 表示这个活动的配额，即有多少用户可以抢到；
 * items 表示按顺序每个用户获得的商品，会在秒杀成功后提示给用户，你可以修改代码来生成这个字段的值。
 */
AV.Cloud.define('createRushStock', {internal: true}, async request => {
  const name = request.params.name
  const quota = parseInt(request.params.quota) || 20

  const items = _.times(quota, String)

  const rush = await new RushStock().save({
    name: name,
    quota: quota,
    items: items,
    status: 'opening'
  })

  const rushId = rush.objectId

  await redisClient.hset('stockRushStocks', rushId, JSON.stringify({rushId, quota, items}))

  return rush
})

/* 供用户获取当前开放的秒杀列表 */
AV.Cloud.define('getOpeningRushs', async request => {
  return _.map(await redisClient.hgetall('stockRushStocks'), (rushStringify, name) => {
    const rushStock = JSON.parse(rushStringify)
    const takedCount = await redisClient.llen(`stockRushStockTaked:${rushStock.rushId}`)

    return {
      name: name,
      rushId: rushStock.rushId,
      quota: rushStock.quota,
      takedCount: takedCount
    }
  })
})

/* 供用户参与秒杀活动 */
AV.Cloud.define('rush', async request => {
  const rushId = request.params.rushId

  if (!request.currentUser) {
    throw new AV.Cloud.Error('当前未登录用户', {status: 401})
  }

  const [rushStringify, takedCount] = await redisClient.multi()
    .hget('stockRushStocks', rushId)
    .llen(`stockRushStockTaked:${rushId}`)
  .exec()

  const rushStock = JSON.parse(rushStringify)

  if (rushStock.quota < takedCount) {
    throw new AV.Cloud.Error('红包已抢完')
  }

  const newTakedCount = await redisClient.rpsuh(`stockRushStockTaked:${rushId}`, request.currentUser.objectId)

  if (takedCount < rushStock.quota) {
    return {message: `恭喜抢到 ${rushStock.items[newTakedCount - 1]}`}
  } else {
    throw new AV.Cloud.Error('红包已抢完')
  }
})

/* 供管理员将秒杀结果提交到云存储 */
AV.Cloud.define('commitRushStock', {internal: true}, async request => {
  const rushId = request.params.rushId

  const rush = await new AV.Query(RushStock).get(rushId)
  const userIds = await redisClient.lrange(`stockRushStockTaked:${rushId}`, 0, rush.get('quota') - 1)

  await rush.save({
    status: 'closed',
    users: userIds.map( userId => {
      return AV.Object.createWithoutData('_User', userId)
    })
  })

  await redisClient.del(`stockRushStockTaked:${rushId}`)
})
