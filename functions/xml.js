const AV = require('leanengine')
const xml2js = require('xml2js')

/*
 * 使用云函数序列化 XML 对象
 *
 * 安装依赖：
 *
 *   npm install xml2js
 *
 */

AV.Cloud.define('xmlBuildObject', request => {
  const builder = new xml2js.Builder()

  const data = {
    xml: {
      ToUserName: 'leancloud',
      FromUserName: 'guest',
      CreateTime: 1462767983071,
      MsgType: 'text',
      Content: '谢谢你，第44位点赞者！'
    }
  }

  return {
    xml: builder.buildObject(data)
  }
})
