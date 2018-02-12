var AV = require('leanengine');

var router = require('express').Router();

/*
 * 云函数任务队列示例
 *
 * 云函数任务队列提供了一种可靠地对云函数进行延时运行、重试、结果通知的能力。
 * 在使用 AV.Cloud.enqueue 将任务加入队列后，将由管理程序确保任务的执行，即使实例重启也没有关系。
 */

/* 延时任务，在 2 秒之后执行 */
router.post('/delay', function(req, res, next) {
  AV.Cloud.enqueue('delayTask', {}, {
    delay: 2000
  }).then( taskInfo => {
    res.json(taskInfo);
  }).catch(next);
});

/* 重试任务，每隔 2 秒重试，最多 5 次 */
router.post('/retry', function(req, res, next) {
  AV.Cloud.enqueue('retryTask', {}, {
    attempts: 5,
    backoff: 2000
  }).then( taskInfo => {
    res.json(taskInfo);
  }).catch(next);
});

/*
 * 以下是示例中用到的云函数
 */

AV.Cloud.define('delayTask', function() {
  console.log('running delayTask');
});

AV.Cloud.define('retryTask', function() {
  var random = Math.random();

  if (random >= 0.5) {
    console.log('running retryTask: success');
  } else {
    console.log(`running retryTask failed: ${random}`);
    throw new AV.Cloud.Error(`failed: ${random}`);
  }
});

module.exports = router;
