const AV = require('leanengine')
const Promise = require('bluebird')

require('../server')

describe('captcha-storage', () => {
  let captchaId
  const mobilePhoneNumber = '18888888888'

  describe('getCaptchaImageStorage', () => {
    it('response have captchaId and imageUrl', async () => {
      const result = await AV.Cloud.run('getCaptchaImageStorage')

      result.should.have.properties(['captchaId', 'imageUrl'])

      captchaId = result.captchaId

      await new AV.Query('Captcha').find().then( captchas => {
        // 因为设置了 ACL，所以非特殊账号无法查询到 captcha 对象
        captchas.length.should.equal(0)
      })
    })
  })

  describe('requestMobilePhoneVerifyStorage', () => {
    it('captcha id mismatch', async () => {
      try {
        await AV.Cloud.run('requestMobilePhoneVerifyStorage', {
          captchaId: 'noThisId',
          captchaCode: '0000',
          mobilePhoneNumber
        })

        throw new Error('should throw')
      } catch (err) {
        err.status.should.be.equal(401)
      }
    })

    it('captcha code mismatch', async () => {
      try {
        await AV.Cloud.run('requestMobilePhoneVerifyStorage', {
          captchaId,
          captchaCode: '0000',
          mobilePhoneNumber
        })

        throw new Error('should throw')
      } catch (err) {
        err.status.should.be.equal(401)
      }
    })

    it('captcha code timeout', async () => {
      // 将超时时间设置为 1 毫秒，强制过期
      process.env.CAPTCHA_TTL = '1'

      await Promise.delay(1500)

      const captchaObj = await new AV.Query('Captcha').get(captchaId, {useMasterKey: true})

      try {
        await AV.Cloud.run('requestMobilePhoneVerifyStorage', {
          captchaId,
          captchaCode: '' + captchaObj.get('code'),
          mobilePhoneNumber
        })

        throw new Error('should throw')
      } catch (err) {
        err.status.should.be.equal(401)
      }
    })

    it('ok', async () => {
      delete process.env.CAPTCHA_TTL

      const captchaObj = await new AV.Query('Captcha').get(captchaId, {useMasterKey: true})

      try {
        await AV.Cloud.run('requestMobilePhoneVerifyStorage', {
          captchaId,
          captchaCode: '' + captchaObj.get('code'),
          mobilePhoneNumber
        })

        throw new Error('should throw')
      } catch (err) {
        err.message.should.match(/phone number was not found/)
      }
    })
  })
})
