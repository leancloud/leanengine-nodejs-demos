const {Router} = require('express')
const AV = require('leanengine')

const router = module.exports = new Router

/*
 * 使用 EJS 渲染 HTML 页面
 *
 * 安装依赖：
 *
 *   npm install ejs
 *
 * 注意检查 app.js 中需要有：
 *
 *   app.set('views', path.join(__dirname, 'views'))
 *   app.set('view engine', 'ejs')
 *
 */

router.get('/', async (req, res) => {
  const todos = await new AV.Query('Todo').include('user').descending('updatedAt').find()

  console.log(todos)

  res.render('todos', {
    title: 'TODO 列表',
    todos: todos
  })
})
