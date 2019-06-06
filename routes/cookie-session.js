const {Router} = require('express')
const AV = require('leanengine')

const router = module.exports = new Router

/*
 * 使用 Cookie Session 示例
 *
 * 注意检查 app.js 中需要有 `app.use(AV.Cloud.CookieSession({ secret: 'randomString', maxAge: 3600000, fetchUser: true }))`
 *
 */

/* 对于已登录的用户会返回用户信息，未登录的用户会返回空 */
router.get('/', (req, res) => {
  res.json(req.currentUser)
})

/* 注册用户并自动登录 */
router.post('/register', async (req, res, next) => {
  const {username, password} = req.body

  const user = new AV.User()

  user.set('username', username)
  user.set('password', password)

  try {
    await user.signUp()
    res.saveCurrentUser(user)
    res.json(user)
  } catch (err) {
    next(err)
  }
})

/* 登录用户 */
router.post('/login', async (req, res, next) => {
  const {username, password} = req.body

  try {
    const user = await AV.User.logIn(username, password)
    res.saveCurrentUser(user)
    res.json(user)
  } catch (err) {
    next(err)
  }
})

/* 登出用户 */
router.post('/logout', (req, res) => {
  res.clearCurrentUser()
  res.sendStatus(204)
})
