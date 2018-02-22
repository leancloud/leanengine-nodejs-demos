#!/usr/bin/env node

const AV = require('leanengine');
const Measured = require('measured');
const Promise = require('bluebird');
const Queue = require('promise-queue');

const MAX_CONCURRENT = parseInt(process.argv[process.argv.length - 1]) || 30;

console.log('MAX_CONCURRENT:', MAX_CONCURRENT);

AV.init({
  appId: process.env.LEANCLOUD_APP_ID,
  appKey: process.env.LEANCLOUD_APP_KEY,
  masterKey: process.env.LEANCLOUD_APP_MASTER_KEY
});

const queue = new Queue(MAX_CONCURRENT, MAX_CONCURRENT * 10);
const timer = new Measured.Timer();
let counts = 0;
let errors = 0;

function request() {
  return new AV.Query('Post').find().then( () => {
    return Promise.delay(20);
  });
}

function fillQueue() {
  for (var i = 0; i < MAX_CONCURRENT * 2 - queue.getQueueLength(); i++){
    queue.add(function() {
      const tracker = timer.start();

      return Promise.try(request).catch( err => {
        errors++;
        console.error(err);
      }).then( () => {
        counts++;
        tracker.end();

        if (queue.getQueueLength() < MAX_CONCURRENT * 2) {
          fillQueue();
        }
      });
    });
  }
}

fillQueue();

setInterval( () => {
  console.log('errors:', errors, 'counts:', counts);
  console.log('metrics:', timer.toJSON());
}, 1000);

/*
  * 压力测试结果

  errors: 0 counts: 535                     --> 错误数量，总请求数
  metrics: { meter:                         --> 请求速率统计
   { mean: 52.70664802801556,               --> 总平均请求速率（个/秒）
     count: 535,
     currentRate: 52.93827947179752,        --> 最近一秒平均请求速率（个/秒）
     '1MinuteRate': 8.13646858079745,       --> 最近一分钟平均请求速率（个/秒）
     '5MinuteRate': 1.737546674453687,
     '15MinuteRate': 0.5856293674221178 },
  histogram:                                --> 响应时间统计
   { min: 167.52557802200317,               --> 最小响应时间（毫秒）
     max: 370.25080701708794,               --> 最大响应时间（毫秒）
     sum: 99939.2678951025,
     variance: 757.9111380733852,           --> 响应时间方差（毫秒）
     mean: 186.80236989738785,              --> 平均响应时间（毫秒）
     stddev: 27.530185943312937,            --> 响应时间标准差（毫秒）
     count: 535,
     median: 180.83333599567413,            --> 中位数响应时间（毫秒）
     p75: 185.1685999929905,                --> 75% 响应时间不高于（毫秒）
     p95: 210.84605119228362,               --> 95% 响应时间不高于（毫秒）
     p99: 348.27025663375855,               --> 99% 响应时间不高于（毫秒）
     p999: 370.25080701708794 } }           --> 99.9% 响应时间不高于（毫秒）
 */
