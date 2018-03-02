var AV = require('leanengine');

var router = require('express').Router();

var Task = AV.Object.extend('Tasks');

/**
 * 长时间异步任务示例
 *
 * 这个示例模拟了这样一个场景，客户端提交了一个耗时较长的计算任务，我们将其加入任务队列来运行，
 * 为了让客户端能够查询任务的执行情况，我们为每个任务在云存储的 Tasks 中创建了一个对象，客户端可以根据 ID 来查询这个任务的执行进度和结果。
 *
 * 即使在运行期间云引擎发生重启或其他故障，任务队列也会将其重试，并且在云存储中有记录可查。
 */

router.post('/tasks', function(req, res, next) {
  new Task().save({
    times: 10,
    status: 'queued'
  }).then( task => {
    AV.Cloud.enqueue('longRunningTask', {
      times: 10,
      taskId: task.id
    }).then( () => {
      res.json(task);
    }).catch(next);
  });
});

router.get('/tasks/:id', function(req, res, next) {
  new AV.Query(Task).get(req.params.id).then( task => {
    res.json(task);
  }).catch(next);
});

/*
 * 以下是示例中用到的云函数
 */

AV.Cloud.define('longRunningTask', function(request) {
  var progress = 0;

  return new Promise( (resolve, reject) => {
    makeProgress();

    function makeProgress() {
      console.log('longRunningTask', progress++);

      new AV.Query(Task).get(request.params.taskId).then( task => {
        task.set('status', progress < request.params.times ? 'running' : 'done');
        task.set('progress', progress);
        return task.save();
      }).then( () => {
        if (progress < request.params.times) {
          setTimeout(makeProgress, 1000);
        } else {
          resolve();
        }
      }).catch(reject);
    }
  });
});

module.exports = router;
