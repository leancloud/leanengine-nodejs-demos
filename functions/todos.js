const AV = require('leanengine')

/*
 * 在云引擎中已客户端的权限来操作云存储
 *
 * 安装依赖：
 *
 *   npm install lodash bluebird
 *
 */

const Todo = AV.Object.extend('Todo')

// 获取所有 Todo 列表
AV.Cloud.define('getAllTodos', async request => {
  const query = new AV.Query(Todo)
  query.equalTo('status', request.params.status || 0)
  query.include('author')
  query.descending('updatedAt')
  query.limit(50)

  try {
    return await query.find({
      // 使用客户端发来的 sessionToken 进行查询
      sessionToken: request.sessionToken
    })
  } catch (err) {
    if (err.code === 101) {
      // 该错误的信息为：{ code: 101, message: 'Class or object doesn\'t exists.' }，说明 Todo 数据表还未创建，所以返回空的 Todo 列表。
      // 具体的错误代码详见：https://leancloud.cn/docs/error_code.html
      return []
    } else {
      throw err
    }
  }
})

// 创建新的 Todo
AV.Cloud.define('createTodo', async request => {
  const todo = new Todo()

  todo.set('content', request.params.content)
  todo.set('status', 0)

  if (request.currentUser) {
    // 如果客户端已登录（发送了 sessionToken），将 Todo 的作者设置为登录用户
    todo.set('author', request.currentUser)
    // 设置 ACL，可以使该 todo 只允许创建者修改，其他人只读
    const acl = new AV.ACL(request.currentUser)
    acl.setPublicWriteAccess(false)
    todo.setACL(acl)
  }

  return todo.save(null, {sessionToken: request.sessionToken})
})

// 删除指定 Todo
AV.Cloud.define('deleteTodo', async request => {
  const todo = AV.Object.createWithoutData('Todo', request.params.id)
  todo.destroy({sessionToken: request.sessionToken})
})

// 将 Todo 标记为已完成
AV.Cloud.define('setTodoToDone', async request => {
  const todo = AV.Object.createWithoutData('Todo', request.params.id)
  todo.save({status: 1}, {sessionToken: request.sessionToken})
})
