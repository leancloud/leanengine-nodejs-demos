const AV = require('leanengine')
const Captchapng = require('captchapng')

const {redisClient} = require('../redis')

/*
 * 使用图形验证码限制短信接口（使用 LeanCache 后端）
 *
 * 在这个例子中，我们会要求用户填写一个图形验证码，只有当验证码填写正确时，才会发送短信，来预防恶意的攻击行为。
 *
 * 安装依赖：
 *
 *   npm install captchapng
 *
 * 设置环境变量：
 *
 *   env CAPTCHA_TTL=600000 # 图形验证码有效期（毫秒）
 *
 */

/* 获取一个验证码，会返回一个 captchaId 和一个 base64 格式的图形验证码 */
AV.Cloud.define('getCaptchaImageCache', async request => {
  const captchaId = Math.random().toString();
  const captchaCode = parseInt(Math.random() * 9000 + 1000)
  const picture = new Captchapng(80, 30, captchaCode)

  picture.color(0, 0, 0, 0)
  picture.color(80, 80, 80, 255)

  await redisClient.setex(captchaKey(captchaId), Math.round((parseInt(process.env.CAPTCHA_TTL) || 600000) / 1000), captchaCode)

  res.json({
    captchaId: captchaId,
    imageUrl: 'data:image/png;base64,' + picture.getBase64()
  })
})

/* 提交验证码，需要提交 captchaId、captchaCode、mobilePhoneNumber，认证成功才会发送短信 */
AV.Cloud.define('requestMobilePhoneVerifyCache', async request => {
  const captchaId = request.params.captchaId

  const captchaCode = await redisClient.get(captchaKey(captchaId))

  if (captchaCode && captchaCode === req.body.captchaCode) {
    // 在验证成功后删除验证码信息，防止验证码被反复使用
    if (await redisClient.del(captchaKey(captchaId))) {
      return await AV.User.requestMobilePhoneVerify(req.body.mobilePhoneNumber)
    }
  }

  throw new AV.Cloud.Error('图形验证码不正确或已过期', {status: 401})
})

/*
 * 更进一步
 *
 * - 四位的短信验证码很容易被穷举出来，因此可以考虑验证码输入错误达到一定次数时，从 Redis 删除这个验证码，要求用户重新获取验证码。
 * - 这个例子中「从 Redis 查询验证码信息」和验证成功后「从 Redis 删除验证码信息」的过程并不是原子的，有关这个话题请参考 http://www.rediscookbook.org/get_and_delete.html
 */
