var Redis = require('ioredis');

function createClient() {
  // 本地环境下此环境变量为 undefined, 会链接到默认的 127.0.0.1:6379
  var redisClient = new Redis(process.env.REDIS_URL_demos);

  redisClient.on('error', function(err) {
    if (process.env.NODE_ENV !== 'production' && process.env.REDIS_URL_test) {
      console.error('redis err: %s', err);
    }
  });

  return redisClient;
}

module.exports = {
  redisClient: createClient(),
  createClient: createClient
};
