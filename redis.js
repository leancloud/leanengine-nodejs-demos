var Redis = require('ioredis');

function createClient() {
  // 本地环境下此环境变量为 undefined, node-redis 会链接到默认的 127.0.0.1:6379
  var redisClient = new Redis(process.env.REDIS_URL_test);

  redisClient.on('error', function(err) {
    return console.error('redis err: %s', err);
  });

  return redisClient;
}

module.exports = {
  redisClient: createClient(),
  createClient: createClient
};
