const AV = require('leanengine')
const crypto = require('crypto')

/*
 * 使用云引擎实现即时通讯服务的签名
 *
 * 使用云引擎对实时通讯服务中的操作进行鉴权，鉴权成功后向客户端下发签名，
 * 这文件中的例子默认会放行所有操作，你需要自行添加拒绝操作的逻辑（抛出一个异常来拒绝此次操作）。
 *
 * 关于实时通讯签名的介绍见 https://leancloud.cn/docs/realtime-guide-senior.html#hash807079806
 * 关于客户端接入签名功能（JavaScript）见 https://leancloud.cn/docs/realtime_guide-js.html#hash807079806
 *
 * 还可以查看测试文件（`test/rtm-signature.js`）来了解这些云函数在客户端的用法。
 */

const APP_ID = process.env.LEANCLOUD_APP_ID
const MASTER_KEY = process.env.LEANCLOUD_APP_MASTER_KEY

AV.Cloud.define('signLogin', async request => {
  const {clientId} = request.params

  // 这里可以执行一些检验，例如您的用户系统里面是否有匹配这个 clientId 的用户，或者该用户存在于自定义的黑名单中，
  // 你可以在此抛出异常来中断签名的过程：
  // throw new AV.Cloud.Error('clientId blocked')

  return sign( (timestamp, nonce) => [APP_ID, clientId, '', timestamp, nonce])
})

AV.Cloud.define('signStartConversation', async request => {
  const {clientId} = request.params
  const members = request.params.members || []

  return sign( (timestamp, nonce) => [APP_ID, clientId, members.sort().join(':'), timestamp, nonce])
})

AV.Cloud.define('signOperateConversation', async request => {
  const {clientId, conversationId, action} = request.params
  const members = request.params.members || []

  return sign( (timestamp, nonce) => [APP_ID, clientId, conversationId, members.sort().join(':'), timestamp, nonce, action])
})

AV.Cloud.define('signQueryMessage', async request => {
  const {clientId, conversationId} = request.params

  return sign( (timestamp, nonce) => [APP_ID, clientId, conversationId || '', timestamp, nonce])
})

AV.Cloud.define('signBlockConversation', async request => {
  const {clientId, conversationId, action} = request.params

  return sign( (timestamp, nonce) => [APP_ID, clientId, conversationId || '', '', timestamp, nonce, action])
})

AV.Cloud.define('signBlockClient', async request => {
  const {clientId, conversationId, action} = request.params
  const members = request.params.members || []

  return sign( (timestamp, nonce) => [APP_ID, clientId, conversationId || '', members.sort().join(':'), timestamp, nonce, action])
})

// func: (timestamp, nonce) -> parts
function sign(func) {
  const timestamp = Math.round(Date.now() / 1000)
  const nonce = getNonce(5)
  const parts = func(timestamp, nonce)
  const msg = parts.filter( part => part != null ).join(':')
  const signature = signSha1(msg, MASTER_KEY)
  return {timestamp, nonce, signature, msg}
}

function signSha1(text, key) {
  return crypto.createHmac('sha1', key).update(text).digest('hex')
}

function getNonce(chars){
  const d = []
  for (let i = 0; i < chars; i++) {
    d.push(Math.round(Math.random() * 10))
  }
  return d.join('')
}
