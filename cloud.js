var AV = require('leanengine');
var _ = require('underscore');

// 声明 Task
var Task = AV.Object.extend('Task');

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function(req, res) {
  console.log(req)
  res.success('Hello world!');
});

// 从 content 中查找 tag 的正则表达式
var tagRe = /#(\w+)/g

/**
 * Todo 的 beforeSave hook 方法
 * 将 content 中的 #<tag> 标记都提取出来，保存到 tags 属性中
 */
AV.Cloud.beforeSave('Todo', function(req, res) {
  var todo = req.object;
  var content = todo.get('content');
  var tags = todo.get('content').match(tagRe);
  tags = _.uniq(tags);
  todo.set('tags', tags);
  res.success();
})

/**
云函数超时示例
https://leancloud.cn/docs/leanengine_cloudfunction_guide-node.html#超时的处理方案
示例中写了一个没有具体业务场景的任务。
写自己的具体业务场景下的任务时，我们建议设计成幂等任务，使其重复执行也不会有问题。
*/
function doTask() {
  console.log('begin task');
  return new Promise(function(resolve, reject) {
    // 随机运行时长 1s ~ 20s 之间
    var randomTime = (Math.floor(Math.random() * 20 + 1)) * 1000;
    setTimeout(function () {
      // 随机时长为奇数时，模拟任务失败
      if (randomTime % 2000 === 0) {
        resolve();
      } else {
        reject(new Error('some reasons for task failed'));
      }
    }, randomTime);
  });
  
}

AV.Cloud.define('doTask', function(req, res) {
  var task = new Task();
  var taskName = req.params.name;
  // 存储任务队列，这里只设置了 name 字段，可以根据业务需求增加其他的字段信息
  task.set('name', taskName);
  // 设置状态为「处理中」
  task.set('status', 'pending');
  task.save().then(function (task) {
    // 先返回任务 Id，再执行任务
    res.success(task.id);
    doTask().then(function() {
      // 任务成功完成，设置状态为「成功」
      task.set('status', 'success');
      return task.save();
    }).then(function(task) {
      console.log('task succeed');
    }).catch(function (error) {
      // 任务失败，设置状态为「失败」
      task.set('status', 'failure');
      task.save().then(function(task) {
        console.log('task failed');
      }).catch(function(error) {
        console.log('更新 task 失败', error);
      });
    });
  }).catch(function(error) {
    // 任务队列保存失败，返回失败
    res.err(error);
  });
});

module.exports = AV.Cloud;
