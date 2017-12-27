var AV = require('leanengine');
var moment = require('moment');

var router = require('express').Router();
var redisClient = require('../redis').redisClient;

/*
 * 排行榜缓存示例
 *
 * 排行榜的查询会比较频繁，而且被查询的都是同一份数据，且数据变化则较少，比较适合维护在 LeanCache 中。
 * 这个例子中我们将允许用户提交自己的游戏分数，然后在 LeanCache 中维护一个全部用户的排行榜，
 * 每天凌晨会将前一天的排行归档到云存储中，并清空排行榜。
 *
 * 这个例子支持两种计算分数的方法 —— 最高分数和累计分数，在实际应用中你应该根据情况在两者中选择一个，删除另外一个：
 *
 * - 最高分数：只记录用户在一天中最高的分数，如果提交一个较低的分数则会被忽略
 * - 累计分数：用户提交的所有分数会被累加到一起进行排名
 */

var Leaderboard = AV.Object.extend('Leaderboard');

/* 提供给用户提交最高分的接口 */
router.post('/submitHighest', function(req, res, next) {
  // 用于提交最高分数的 LUA 脚本，只会在新分数比最高分还高时才更新分数
  var script = 'local highest = tonumber(redis.call("ZSCORE", KEYS[1], ARGV[2]))\n' +
               'if highest == nil or tonumber(ARGV[1]) > highest then redis.call("ZADD", KEYS[1], ARGV[1], ARGV[2]) end';

  redisClient.eval(script, 1, redisLeaderboardKey(), req.body.score, req.body.userId).then(function(r) {
    res.send();
  }).catch(next);
});

/* 提供给用户提交累计分数的接口 */
router.post('/submitAccumulative', function(req, res, next) {
  redisClient.zadd(redisLeaderboardKey(), req.body.score, req.body.userId, 'INCR').then(function() {
    res.send();
  }).catch(next);
});

/* 查询排行榜前若干名的接口 */
router.get('/users', function(req, res, next) {
  var limit = req.query.limit || 100;
  redisClient.zrevrange(redisLeaderboardKey(), 0, limit - 1, 'WITHSCORES').then(function(leaderboard) {
    res.json(parseLeaderboard(leaderboard));
  }).catch(next);
});

/* 查询一个用户在榜单上的排名 */
router.get('/users/:userId', function(req, res, next) {
  redisClient.zscore(redisLeaderboardKey(), req.params.userId).then(function(score) {
    if (score === null) {
      res.sendStatus(404);
    } else {
      return redisClient.zrevrank(redisLeaderboardKey(), req.params.userId).then(function(index) {
        res.json({
          ranking: index + 1,
          userId: req.params.userId,
          score: parseInt(score)
        });
      });
    }
  }).catch(next);
});

/* 用于归档前一天排行榜的定时任务，请在控制台上新建一个每天凌晨一点的定时任务 */
AV.Cloud.define('archiveLeaderboard', function(request, response) {
  var yesterday = moment().subtract(1, 'day');
  // 查询前一天的整个排行榜
  redisClient.zrevrange(redisLeaderboardKey(yesterday), 0, -1, 'WITHSCORES').then(function(leaderboard) {
    // 保存排行榜到云存储
    return new Leaderboard().save({
      date: yesterday.format('YYYYMMDD'),
      users: parseLeaderboard(leaderboard)
    });
  }).then(function() {
    // 删除 LeanCache 中昨天的排行榜
    return redisClient.del(redisLeaderboardKey(yesterday));
  }).then(function() {
    response.success();
  }, console.error);
});

/* 排行榜存储在 LeanCache 中的键名，按照当前日期存储为一个 ZSET，值是用户 ID */
function redisLeaderboardKey(time) {
  return 'leaderboard:' + moment(time).format('YYYYMMDD');
}

// 将 ZRANGE 的结果解析为 {ranking, userId, score} 这样的对象
function parseLeaderboard(leaderboard) {
  return chunk(leaderboard, 2).map(function(item, index) {
    return {
      ranking: index + 1,
      userId: item[0],
      score: parseInt(item[1])
    };
  });
}

// 将 array 中每 size 个元素包装为一个数组
function chunk(array, size) {
  return array.reduce(function(res, item, index) {
    if (index % size === 0) { res.push([]); }
    res[res.length-1].push(item);
    return res;
  }, []);
}

/*
 * 更进一步
 *
 * - 这个排行榜中只有用户 ID, 你可能需要结合「缓存关联数据示例」来一并显示用户的昵称等信息。
 * - 为了防止 archiveLeaderboard 被重复调用，建议在 Leaderboard 的 date 字段上设置唯一索引。
 */

module.exports = router;
