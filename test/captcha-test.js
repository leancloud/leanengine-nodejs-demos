const request = require('supertest-as-promised');
const AV = require('leanengine');

const app = require('../app')
const config = require('../config')

describe('/captcha', () => {

  let captchaId;
  const mobilePhoneNumber = 18888888888;

  describe('GET /captcha/image', () => {
    it('response have captchaId and imageUrl', () => {
      return request(app)
      .get('/captcha/image')
      .expect(200)
      .then((res) => {
        res.body.should.have.properties(['captchaId', 'imageUrl'])
        captchaId = res.body.captchaId
        return new AV.Query('Captcha').find().then((captchas) => {
          // 因为设置了 ACL，所以非特殊账号无法查询到 captcha 对象
          captchas.length.should.equal(0)
        })
      })
    })
  })

  describe('POST /captcha/verify', () => {
    it('captcha id mismatch', () => {
      return request(app)
      .post('/captcha/verify')
      .send({
        captchaId: 'noThisId',
        captchaCode: '0000',
        mobilePhoneNumber,
      })
      .expect(401)
    })

    it('captcha code mismatch', () => {
      return request(app)
      .post('/captcha/verify')
      .send({
        captchaId,
        captchaCode: '0000',
        mobilePhoneNumber,
      })
      .expect(401)
    })

    it('captcha code timeout', () => {
      // 将超时时间设置为 1 毫秒，强制过期
      config.captcha.ttl = 1;
      return new AV.Query('Captcha').get(captchaId, {useMasterKey: true})
      .then((captchaObj) => {
        return request(app)
        .post('/captcha/verify')
        .send({
          captchaId,
          captchaCode: '' + captchaObj.get('code'),
          mobilePhoneNumber,
        })
        .expect(401)
      })
    })

    it('ok', () => {
      config.captcha.ttl = 60 * 1000;
      return new AV.Query('Captcha').get(captchaId, {useMasterKey: true})
      .then((captchaObj) => {
        return request(app)
        .post('/captcha/verify')
        .send({
          captchaId,
          captchaCode: '' + captchaObj.get('code'),
          mobilePhoneNumber,
        })
        .expect(200)
      })
    })
  })
})
