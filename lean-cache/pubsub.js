var router = require('express').Router();
var {redisClient, createClient} = require('../redis');

router.post('/sendMessage', function(req, res) {
  redisClient.publish('objects', JSON.stringify(req.body));
  res.send();
});

var redisSubscriber = createClient();

redisSubscriber.subscribe('objects');

redisSubscriber.on('message', function(channel, message) {
  console.log('redis-pub-sub message', channel, JSON.parse(message));
});

module.exports = router;
