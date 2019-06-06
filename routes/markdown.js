const {Router} = require('express')
const marked = require('marked')
const fs = require('fs').promises

const router = module.exports = new Router

/*
 * 项目主页，将 README.md 渲染成 HTML 显示在页面上
 *
 * 安装依赖：
 *
 *   npm install marked
 *
 */

router.get('/', async (req, res, next) => {
  try {
    res.send(marked(await fs.readFile('README.md', 'utf8')))
  } catch (err) {
    next(err)
  }
})
