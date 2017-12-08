var Captchapng = require('captchapng');
var AV = require('leanengine');

var router = require('express').Router();
const config = require('../config');

/*
 * 图形验证码示例
 *
 * 在这个例子中，我们会要求用户填写一个图形验证码，只有当验证码填写正确时，才会发送短信，来预防恶意的攻击行为。
 */

/* 获取一个验证码，会返回一个 captchaId 和一个 base64 格式的图形验证码 */
router.get('/image', function(req, res, next) {
  var captchaCode = parseInt(Math.random() * 9000 + 1000);
  var picture = new Captchapng(80, 30, captchaCode);
  picture.color(0, 0, 0, 0);
  picture.color(80, 80, 80, 255);

  // 使用一个空的 ACL，确保没有任何用户可读可写 captcha 对象
  // 后续所有对 captcha 对象的查询和修改操作都在云引擎中，
  // 并且使用 masterKey 权限进行操作。
  return new AV.Object('Captcha').setACL(new AV.ACL()).save({
    code: captchaCode,
    isUsed: false,
  }).then(function(captcha) {
    res.json({
      captchaId: captcha.id,
      imageUrl: 'data:image/png;base64,' + picture.getBase64()
    });
  }).catch(next);
});

/* 提交验证码，需要提交 captchaId、captchaCode、mobilePhoneNumber，认证成功才会发送短信 */
router.post('/verify', function(req, res, next) {
  const captchaId = req.body.captchaId;
  const captchaCode = parseInt(req.body.captchaCode);
  // 将「验证 id 和 code 是否有效」的查询放在「更新验证码状态」的保存操作中，
  // 保证两个操作的原子化
  return AV.Object.createWithoutData('Captcha', captchaId).save({
    isUsed: true
  }, {
    useMasterKey: true, // 确保使用 masterKey 权限进行操作，否则无权读写 captcha 记录
    query: new AV.Query('Captcha')
      .equalTo('objectId', captchaId)
      .equalTo('code', captchaCode)
      .greaterThanOrEqualTo('createdAt', new Date(new Date().getTime() - config.captcha.ttl))
      .equalTo('isUsed', false),
  }).then(function() {
    // 通过验证，之后可以做需要的业务逻辑，比如发送短信
    // return AV.User.requestMobilePhoneVerify(req.body.mobilePhoneNumber)
  }).then(function() {
    return res.send();
  }).catch(function(err) {
    if (err.code === 305) {
      // query 条件不匹配，所以对记录更新不成功
      return res.sendStatus(401);
    } else if (err.message.indexOf('Could not find object') === 0) {
      // 指定 id 不存在
      return res.sendStatus(401);
    }
    next(err);
  });
});

/*
 * 更进一步
 *
 * - 四位的短信验证码很容易被穷举出来，因此可以考虑验证码输入错误达到一定次数时，从存储服务更新验证码的状态为「已使用」，要求用户重新获取验证码。
 */

module.exports = router;
