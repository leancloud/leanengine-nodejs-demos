var express = require('express');
var router = express.Router();

// 需要引入 `cloudcode-nodejs-sdk` 模块，该模块扩展了 JS-SDK 中的 AV 对象，
// 增加了云代码的一些支持。
// 该 AV 对象不需要初始化，因为 `cloudcode-nodejs-sdk` 已经初始化完成。
var AV = require('cloudcode-nodejs-sdk');

// `AV.Object.extend` 方法一定要放在全局变量，否则会造成堆栈溢出，
// 具体原因见： https://leancloud.cn/docs/js_guide.html#对象
var Todo = AV.Object.extend('Todo');

/**
 * 定义路由：获取所有 TODO 列表
 */
router.get('/', function(req, res, next) {
  var status = 0;
  if (req.query) {
    status = req.query.status || 0;
  }
  console.log(status)
  var query = new AV.Query(Todo);
  query.limit(20);
  query.equalTo('status', parseInt(status));
  query.descending('updatedAt');
  query.find({
    success: function(results) {
      res.render('todos', { todos: results });
    },
    error: function(err) {
      next(err);
    }
  })
});

/**
 * 定义路由：创建新的 TODO
 */
router.post('/', function(req, res, next) {
  var content = req.body.content;
  var todo = new Todo();
  todo.set('content', content);
  todo.set('status', 0);
  todo.save(null, {
    success: function(todo) {
      res.redirect('/todos')
    },
    error: function(err) {
      next(err);
    }
  });
});

router.post('/done', function(req, res, next) {
  var id = req.body.id;
  var todo = AV.Object.createWithoutData('Todo', id);
  todo.save({'status': 1}, {
    success: function() {
      res.redirect('/todos')
    },
    error: function(err) {
      next(err);
    }
  })
})

module.exports = router;
