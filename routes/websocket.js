const {Router} = require('express')

const router = module.exports = new Router

/*
 * WebSocket 示例
 *
 * 注意检查 app.js 中需要有 `require('express-ws')(app)`
 *
 * 可以使用 wscat 或 websocat 来对 WebSocket API 进行测试
 * https://github.com/websockets/wscat
 * https://github.com/vi/websocat
 *
 * 安装依赖：
 *
 *   npm install express-ws
 *
 */

/*
 * 将客户端发来的消息原样发回客户端
 * wscat -c ws://localhost:3000/websocket/echo
*/
router.ws('/echo', (ws, req) => {
  ws.on('message', (msg) => {
    ws.send(msg)
  })
})

/*
 * 每隔一秒向客户端发送一条消息
 * wscat -c ws://localhost:3000/websocket/timer
*/
router.ws('/timer', (ws, req) => {
  const intervalId = setInterval( () => {
    ws.send('Hello')
  }, 1000)

  ws.on('close', (msg) => {
    clearInterval(intervalId)
  })
})
