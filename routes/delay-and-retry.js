var AV = require('leanengine');

var router = require('express').Router();

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

router.post('/delay', function(req, res, next) {
  AV.Cloud.enqueue('delayTask', {}, {
    delay: 2000
  }).then( taskInfo => {
    res.json(taskInfo);
  }).catch(next);
});

router.post('/retry', function(req, res, next) {
  AV.Cloud.enqueue('retryTask', {}, {
    attempts: 5,
    backoff: 2000
  }).then( taskInfo => {
    res.json(taskInfo);
  }).catch(next);
});

module.exports = router;
