const AV = require('leanengine')
const Promise = require('bluebird')

/*
 * 云函数任务队列：结果查询
 *
 * 在调用 `Cloud.enqueue` 时会返回一个 uniqueId，云引擎或客户端可以使用这个 uniqueId 进行高性能的结果查询。
 */

AV.Cloud.define('createTask', async request => {
  const {uniqueId} = await AV.Cloud.enqueue('longRunningTask', request.params)
  return {uniqueId}
})

/*
 * 结果类似：
 *
 * {
 *  "finishedAt": "2019-05-31T07:23:19.467Z",
 *  "statusCode": 200,
 *  "result": {
 *    "result": "10.22490261065305583"
 *  },
 *  "uniqueId": "b6cd3d33-908c-4c91-8ad9-527a23ac4bf5",
 *  "status": "success"
 * }
 *
 * Cloud.getTaskInfo` 其实也可以放在在客户端执行。
 */
AV.Cloud.define('queryResult', async request => {
  return await AV.Cloud.getTaskInfo(request.params.uniqueId)
})

/* 被执行的任务 */
AV.Cloud.define('longRunningTask', async request => {
  await Promise.delay(10000)
  return (request.params.base || 0) + Math.random()
})
