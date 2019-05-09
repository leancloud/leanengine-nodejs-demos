const Redis = require('ioredis')

function createClient() {
  // 本地环境下此环境变量为 undefined, 会链接到默认的 127.0.0.1:6379，
  // 你需要将 `demos` 修改为你的 LeanCache 实例名称
  const redisClient = new Redis(process.env['REDIS_URL_demos'])

  redisClient.on('error', function(err) {
    console.error('redisClient error', err)
  })

  return redisClient
}

module.exports = {
  redisClient: createClient(),
  createClient: createClient
}
