const AV = require('leanengine')
const _ = require('lodash')

/*
 * 从运行环境或客户端读取元信息（环境变量、用户、参数请求头）
 *
 * 安装依赖：
 *
 *   npm install lodash
 *
 */

// 返回环境变量
// **注意！** 环境变量中可能包含有有你自行添加的敏感信息（如第三方平台的密钥），因此该函数只会在开发环境下工作，请谨慎在线上应用中添加该函数。
AV.Cloud.define('getEnvironments', async request => {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    // 去除 masterKey 和 LeanCache 连接字符串等含有敏感信息的环境变量
    return _.mapValues(process.env, function(value, key) {
      if (_.startsWith(key, 'REDIS_URL') || _.includes(['LC_APP_MASTER_KEY'], key)){
        return null
      } else {
        return value
      }
    })
  }
})

// 返回客户端的当前用户
AV.Cloud.define('getUser', async request => {
  return request.currentUser
})

// 返回客户端的请求参数
AV.Cloud.define('getParams', async request => {
  return request.params
})

// 返回客户端的额外元信息（IP 地址等）
AV.Cloud.define('getClientMeta', async request => {
  return request.meta
})

// 返回客户端的请求头
AV.Cloud.define('getHeaders', async request => {
  // 内部接口，请勿在业务代码中使用
  return request.expressReq.headers
})
