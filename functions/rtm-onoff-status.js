var AV = require('leanengine');

var redis = require("redis"),
    redisClient = redis.createClient(process.env['REDIS_URL_rtm_onoff_status']);

redisClient.on("error", function (err) {
    console.log("Redis Error: " + err);
});

const {promisify} = require('util');
const mgetAsync = promisify(redisClient.mget).bind(redisClient);

AV.Cloud.define('_clientOnline', async function(request) {
  redisClient.set(request.params.peerId, true);
});

AV.Cloud.define('_clientOffline', async function(request) {
  redisClient.set(request.params.peerId, false);
});

AV.Cloud.define('getOnOffStatus', async function(request) {
  const res = await mgetAsync(request.params.peerIds);
  return res;
});