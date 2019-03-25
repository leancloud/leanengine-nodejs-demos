const {Router} = require('express')
const wechat = require('wechat')

/*
 * 接受并自动回复微信公众平台的用户消息回调
 *
 *   npm install wechat
 *
 *   env WECHAT_APPID # 微信公众平台应用 ID（必填）
 *   env WECHAT_TOKEN # 微信公众平台 Key（必填）
 *   env encodingAESKey # 微信公众平台 AES 密钥（必填）
 */

const wechatConfig = {
  token: process.env.WECHAT_TOKEN,
  appid: process.env.WECHAT_APPID,
  encodingAESKey: process.env.WECHAT_ENCODING_AES_KEY
}

const router = module.exports = new Router

router.use('/', wechat(wechatConfig)
  .text( (message, req, res, _next) => {
    if (message.Content === '你好') {
      res.reply({
        type: 'text',
        content: '你好!'
      })
    } else {
      res.reply({
        type: 'text',
        content: '抱歉，请对我说「你好」'
      })
    }
  })
  .image( (message, req, res, _next) => {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    })
  })
  .voice( (message, req, res, _next) => {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    })
  })
  .video( (message, req, res, _next) => {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    })
  })
  .shortvideo( (message, req, res, _next) => {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    })
  })
  .location( (message, req, res, _next) => {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    })
  })
  .link( (message, req, res, _next) => {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    })
  })
  .event( (message, req, res, _next) => {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    })
  }).device_text( (message, req, res, _next) => {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    })
  })
  .device_event( (message, req, res, _next) => {
    res.reply({
      type: 'text',
      content: JSON.stringify(message)
    })
  })
  .middlewarify())
