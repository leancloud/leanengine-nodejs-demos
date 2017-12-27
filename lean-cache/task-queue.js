var Promise = require('bluebird');

var router = require('express').Router();
var redisClient = require('../redis').redisClient;
var createClient = require('../redis').createClient;

/*
 * 任务队列示例
 *
 * 这个例子实现了一个跨实例的任务队列，借助 Redis 来分派任务，可以确保同一时间只有指定数量的任务并发执行。
 * 例如我们的程序需要访问一个耗时较长的外部的服务，但为了不给这个外部服务造成过大的压力，我们希望同一时间的并发任务不超过 2 个。
 */

/* 创建一个新任务，返回当前排队的任务数量 */
router.post('/createTask', function(req, res, next) {
  redisClient.rpush('task-queue', req.body.name || 'hello').then(function(length) {
    res.json({
      taskLength: length
    });
  }).catch(next);
});

/* 这里以一个随机等待几百毫秒的任务为例，会在开始和结束时打印一条日志 */
function task(name) {
  console.log('begin task', name);
  return Promise.delay(Math.random() * 1000).then(function() {
    console.log('finished task', name);
  });
}

/* 我们需要使用这个函数来创建 worker, 一个 worker 同一时间只执行一个任务 */
function createWorker(task) {
  var redisClient = createClient();

  var worker = function() {
    // BLPOP 会阻塞地等待列表中的新元素，所以我们签名新建一个 redisClient.
    redisClient.blpop('task-queue', 0).then(function(result) {
      if (result[0]) {
        return task(result[1]);
      }
    }).catch(function(err) {
      console.error(err.stack);
    }).finally(function() {
      // 开始执行下一个任务
      worker();
    });
  };

  worker();
}


// 创建两个 Worker, 因此同一时间只会并发执行两个任务。
createWorker(task);
createWorker(task);

/*
 * 更进一步
 *
 * - Node.js 社区还有一些功能更强大的基于 Redis 的任务队列可供选用，例如 https://github.com/Automattic/kue
 */

module.exports = router;
