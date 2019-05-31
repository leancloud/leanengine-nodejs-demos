const AV = require('leanengine')

/*
 * 云函数任务队列：延时和重试
 *
 * 云函数任务队列提供了一种可靠地对云函数进行延时运行、重试、结果查询的能力。
 * 在使用 AV.Cloud.enqueue 将任务加入队列后，将由管理程序确保任务的执行，即使实例重启也没有关系。
 */

AV.Cloud.define('queueDelayTask', async request => {
  // 延时任务，在 2 秒之后执行
  return AV.Cloud.enqueue('delayTaskFunc', {name: 'world'}, {delay: 5000})
})

AV.Cloud.define('queueRetryTask', async request => {
  // 重试任务，每隔 2 秒重试，最多 5 次
  return AV.Cloud.enqueue('retryTaskFunc', null, {attempts: 5, backoff: 2000})
})

/*
 * 以下是示例中用到的云函数
 */

AV.Cloud.define('delayTaskFunc', async request => {
  console.log('hello', request.params.name)
})

AV.Cloud.define('retryTaskFunc', async request => {
  const random = Math.random()

  if (random >= 0.5) {
    console.log('running luckyFunc: success')
  } else {
    throw new AV.Cloud.Error(`failed: ${random}`)
  }
})
