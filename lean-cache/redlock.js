var Promise = require('bluebird');
var AV = require('leanengine');
var os = require('os');
var _ = require('underscore');

var router = require('express').Router();
var redisClient = require('../redis').redisClient;

/*
 * 节点选举和锁示例
 *
 * 在这个例子中，我们有一个耗时的操作（task）需要独占一项资源（some-lock），因此我们用 SET 加上 NX 参数来原子性地获取这个资源，
 * 只有当获取成功才会去执行具体的任务，保证同一时间只有一个任务在执行。
 */

/* 设置一个定时任务，每隔半秒尝试执行 task */
router.post('/start', function(req, res, next) {
  setInterval(runTask.bind(null, 'some-lock', task), req.query.interval || 500);
  res.send();
});

/* 我们可以从 Redis 中查到当前是哪个 task 在持有这个锁 */
router.get('/', function(req, res, next) {
  redisClient.get('some-lock').then(function(workerId) {
    res.json({
      lockedBy: workerId
    });
  }).catch(next);
});

/* 这里以一个随机等待几百毫秒的任务为例，会在开始和结束时打印一条日志 */
function task(taskId) {
  console.log(taskId, 'got lock');
  return Promise.delay(Math.random() * 1000).then(function() {
    console.log(taskId, 'release lock');
  });
}

/* 为了保证同一时间只有一个 task 在执行，我们需要用这个函数，参数分别是锁的名字和要执行的函数（需要返回一个 Promise） */
function runTask(lock, task) {
  var taskId = [lock, os.hostname(), process.pid, _.uniqueId()].join(':');

  // NX 表示仅当不存在这个键的情况下才创建（说明我们得到了这个锁），5 是锁的超时时间（秒）
  redisClient.set(lock, taskId, 'EX', 5, 'NX').then(function(result) {
    if (result) {
      task(taskId).finally(function() {
        redisClient.del(lock).catch(function(err) {
          console.error(err.stack);
        });
      });
    } else {
      console.log(taskId, 'fail to get lock');
    }
  }).catch(function(err) {
    console.error(err.stack);
  });
}

/*
 * 更进一步
 *
 * - 这个示例大体上遵守了 Redlock 协议，可以在 http://redis.io/topics/distlock 了解到有关 Redlock 的更多内容。
 */

module.exports = router;
