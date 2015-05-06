var express = require('express');
var router = express.Router();
var AV = require('leanengine-sdk');

// `AV.Object.extend` 方法一定要放在全局变量，否则会造成堆栈溢出。
// 详见： https://leancloud.cn/docs/js_guide.html#对象
var Todo = AV.Object.extend('Todo');

/**
 * 定义路由：获取所有 Todo 列表
 */
router.get('/', function(req, res, next) {
  var status = 0;
  var errMsg = null;
  if (req.query) {
    status = req.query.status || 0;
    errMsg = req.query.errMsg;
  }
  var query = new AV.Query(Todo);
  query.equalTo('status', parseInt(status));
  query.include('author');
  query.descending('updatedAt');
  query.limit(20);
  query.find({
    success: function(results) {
      res.render('todos', {
        title: 'TODO 列表',
        user: AV.User.current(),
        todos: results, 
        status: status,
        errMsg: errMsg
      });
    },
    error: function(err) {
      next(err);
    }
  })
});

/**
 * 定义路由：创建新的 todo
 */
router.post('/', function(req, res, next) {
  var content = req.body.content;
  var todo = new Todo();
  if (req.AV.user) {
    // 设置 ACL，可以使该 todo 只允许创建者修改，其他人只读
    // 更多的 ACL 控制详见： https://leancloud.cn/docs/js_guide.html#其他对象的安全
    var acl = new AV.ACL(req.AV.user);
    acl.setPublicReadAccess(true);
    todo.setACL(acl);
  }
  todo.set('content', content);
  todo.set('status', 0);
  if (req.AV.user) {
    todo.set('author', req.AV.user);
  }
  todo.save(null, {
    success: function(todo) {
      res.redirect('/todos')
    },
    error: function(err) {
      next(err);
    }
  });
});

/**
 * 定义路由：删除指定 todo
 */
router.delete('/:id', function(req, res, next) {
  var id = req.params.id;
  var status = req.query.status;
  var todo = AV.Object.createWithoutData('Todo', id);
  todo.destroy({
    success: function(todo) {
      res.redirect('/todos?status=' + status);
    },
    error: function(todo, err) {
      res.redirect('/todos?status=' + status + '&errMsg=' + JSON.stringify(err))
    }
  })
})

/**
 * 定义路由：标记指定 todo 状态为「完成」
 */
router.post('/:id/done', function(req, res, next) {
  var id = req.params.id;
  var todo = AV.Object.createWithoutData('Todo', id);
  todo.save({'status': 1}, {
    success: function() {
      res.redirect('/todos')
    },
    error: function(todo, err) {
      res.redirect('/todos?errMsg=' + JSON.stringify(err))
    }
  })
})

/**
 * 定义路由：标记指定 todo 状态为「未完成」
 */
router.post('/:id/undone', function(req, res, next) {
  var id = req.params.id;
  var todo = AV.Object.createWithoutData('Todo', id);
  todo.save({'status': 0}, {
    success: function() {
      res.redirect('/todos?status=1')
    },
    error: function(status, err) {
      res.redirect('/todos?status=1&errMsg=' + JSON.stringify(err))
    }
  })
})

module.exports = router;
