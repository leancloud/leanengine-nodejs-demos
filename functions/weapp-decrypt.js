const AV = require('leanengine')
const crypto = require('crypto')

/*
 * 解密微信小程序用户加密数据
 *
 * 该云函数会使用云存储用户信息中的 sessionKey（`authData.lc_weapp.session_key`，需要用 `AV.User.loginWithWeapp` 登录后才会有）
 * 来对 `wx.getUserInfo` 中的 encryptedData 进行解密，返回解密后的完整信息。
 *
 * 设置环境变量：
 *
 *   env WEAPP_APPID # 微信小程序 App ID（选填，会检查数据是否属于当前小程序）
 *
 */

/* 参数：encryptedData、iv */
AV.Cloud.define('decryptWeappData', async request => {
  const {currentUser} = request

  if (currentUser && currentUser.get('authData') && currentUser.get('authData').lc_weapp) {
    const encryptedData = Buffer.from(request.params.encryptedData, 'base64')
    const iv = Buffer.from(request.params.iv, 'base64')
    const sessionKey = Buffer.from(currentUser.get('authData').lc_weapp.session_key, 'base64')

    const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)

    decipher.setAutoPadding(true)

    const decrypted = decipher.update(encryptedData, 'binary', 'utf8') + decipher.final('utf8')
    const parsed = JSON.parse(decrypted)

    if (process.env.WEAPP_APPID && parsed.watermark.appid !== process.env.WEAPP_APPID) {
      throw new AV.Cloud.Error('加密数据不属于该小程序应用')
    }

    return parsed
  } else {
    throw new AV.Cloud.Error('用户未登录或未关联微信小程序', {status: 401})
  }
})
