var router = require('express').Router();
var wechat = require('wechat'); // 引用 wechat 库，详细请查看 https://github.com/node-webot/wechat

var config = {
  token: process.env.WECHAT_TOKEN,
  appid: process.env.WECHAT_APPID,
  encodingAESKey: process.env.WECHAT_ENCODING_AES_KEY,
  checkSignature: process.env.WECHAT_CHECK_SIGNATURE,
};

router.use('/', wechat(config)
  .text(function(message, req, res, _next) {
    if (message.Content === '你好') {
      res.reply({
        type: 'text',
        content: '你好!'
      });
    } else {
      res.reply({
        type: 'text',
        content: '抱歉，请对我说「你好」'
      });
    }
  })
  .image(function(message, req, res, _next) {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    });
  })
  .voice(function(message, req, res, _next) {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    });
  })
  .video(function(message, req, res, _next) {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    });
  })
  .shortvideo(function(message, req, res, _next) {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    });
  })
  .location(function(message, req, res, _next) {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    });
  })
  .link(function(message, req, res, _next) {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    });
  })
  .event(function(message, req, res, _next) {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    });
  }).device_text(function(message, req, res, _next) {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    });
  })
  .device_event(function(message, req, res, _next) {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    });
  })
  .middlewarify());

module.exports = router;
