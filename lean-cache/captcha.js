var Captchapng = require('captchapng');
var AV = require('leanengine');

var router = require('express').Router();
var redisClient = require('../redis').redisClient;

/*
 * 图形验证码示例
 *
 * 在这个例子中，我们会要求用户填写一个图形验证码，只有当验证码填写正确时，才会发送短信，来预防恶意的攻击行为。
 */

/* 获取一个验证码，会返回一个 captchaId 和一个 base64 格式的图形验证码 */
router.get('/image', function(req, res, next) {
  var captchaId = Math.random().toString();
  var captchaCode = parseInt(Math.random() * 9000 + 1000);
  var picture = new Captchapng(80, 30, captchaCode);
  picture.color(0, 0, 0, 0);
  picture.color(80, 80, 80, 255);

  redisClient.setex(captchaKey(captchaId), 600, captchaCode).then(function() {
    res.json({
      captchaId: captchaId,
      imageUrl: 'data:image/png;base64,' + picture.getBase64()
    });
  }).catch(next);
});

/* 提交验证码，需要提交 captchaId、captchaCode、mobilePhoneNumber，认证成功才会发送短信 */
router.post('/verify', function(req, res, next) {
  redisClient.get(captchaKey(req.body.captchaId)).then(function(captchaCode) {
    if (captchaCode && captchaCode === req.body.captchaCode) {
      // 在验证成功后删除验证码信息，防止验证码被反复使用
      return redisClient.del(captchaKey(req.body.captchaId)).then(function() {
        return AV.User.requestMobilePhoneVerify(req.body.mobilePhoneNumber).then(function() {
          return res.send();
        });
      });
    } else {
      res.sendStatus(401);
    }
  }).catch(next);
});

function captchaKey(captchaId) {
  return 'captcha:' + captchaId;
}

/*
 * 更进一步
 *
 * - 四位的短信验证码很容易被穷举出来，因此可以考虑验证码输入错误达到一定次数时，从 Redis 删除这个验证码，要求用户重新获取验证码。
 * - 这个例子中「从 Redis 查询验证码信息」和验证成功后「从 Redis 删除验证码信息」的过程并不是原子的，有关这个话题请参考 http://www.rediscookbook.org/get_and_delete.html
 */

module.exports = router;
