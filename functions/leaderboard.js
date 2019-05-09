const AV = require('leanengine')
const _ = require('lodash')
const moment = require('moment')

const {redisClient} = require('../redis')
const Leaderboard = AV.Object.extend('Leaderboard')

/*
 * 使用 LeanCache 实现排行榜
 *
 * 排行榜的查询会比较频繁，而且被查询的都是同一份数据，且数据变化则较少，比较适合维护在 LeanCache 中。
 * 这个例子中我们将允许用户提交自己的游戏分数，然后在 LeanCache 中维护一个全部用户的排行榜，
 * 每天凌晨会将前一天的排行归档到云存储中，并清空排行榜。
 *
 * 安装依赖：
 *
 *   npm install moment lodash
 *
 */

/* 用于提交最高分数的 LUA 脚本，只会在新分数比最高分还高时才更新分数 */
redisClient.defineCommand('setHighest', {
  numberOfKeys: 1,
  lua: `
    local highest = tonumber(redis.call("ZSCORE", KEYS[1], ARGV[2]))
    if highest == nil or tonumber(ARGV[1]) > highest then
        redis.call("ZADD", KEYS[1], ARGV[1], ARGV[2])
    end
  `
})

/* 排行榜存储在 LeanCache 中的键名，按照当前日期存储为一个 ZSET，值是用户 ID */
function redisKey(time) {
  return 'leaderboard:' + moment(time).format('YYYYMMDD')
}

/* 提交当前用户的最高分数 */
AV.Cloud.define('submitHighest', async request => {
  if (request.currentUser) {
    await redisClient.setHighest(redisKey(), request.params.score, request.currentUser.objectId)
  } else {
    throw new AV.Cloud.Error('当前未登录用户，无法提交分数', {status: 401})
  }
})

/* 查询排行榜的特定排名范围（默认前 100） */
AV.Cloud.define('getRankRange', async request => {
  const start = request.params.start || 0
  const end = request.params.end || 99

  return parseLeaderboard(await redisClient.zrevrange(redisKey(), start, end, 'WITHSCORES'))
})

/* 查询排行榜的特定分数范围（默认前 100） */
AV.Cloud.define('getScoreRange', async request => {
  const max = request.params.start || '+inf'
  const min = request.params.end || '-inf'
  const limit = request.params.limit || 100

  return parseLeaderboard(await redisClient.zrevrangebyscore(redisKey(), max, min, 'WITHSCORES', 'LIMIT', 0, limit))
})

/* 查询用户在排行榜上的排名和分数（默认当前用户） */
AV.Cloud.define('getRankAndScore', async request => {
  const userId = request.params.userId || request.currentUser.objectId

  const score = await redisClient.zscore(redisKey(), userId)

  if (score === null) {
    throw new AV.Cloud.Error('用户在排行榜上不存在', {status: 404})
  } else {
    return {
      rank: await redisClient.zrevrank(redisKey(), userId),
      userId: userId,
      score: score
    }
  }
})

/* 用于归档前一天排行榜的定时任务，请在控制台上新建一个每天凌晨一点的定时任务 */
AV.Cloud.define('archiveLeaderboard', async request => {
  const yesterday = moment().subtract(1, 'day')

  const leaderboard = await redisClient.zrevrange(redisKey(), 0, -1, 'WITHSCORES')

  await new Leaderboard().save({
    date: yesterday.format('YYYYMMDD'),
    users: parseLeaderboard(leaderboard)
  })

  await redisClient.del(redisKey(yesterday));
})

// 将 ZRANGE 的结果解析为 {ranking, userId, score} 这样的对象
function parseLeaderboard(leaderboard) {
  return _.chunk(leaderboard, 2).map(function(item, index) {
    return {
      ranking: index + 1,
      userId: item[0],
      score: parseInt(item[1])
    }
  })
}

/*
 * 更进一步
 *
 * - 这个排行榜中只有用户 ID, 你可能需要结合「缓存关联数据示例」来一并显示用户的昵称等信息。
 * - 为了防止 archiveLeaderboard 被重复调用，建议在 Leaderboard 的 date 字段上设置唯一索引。
 */
