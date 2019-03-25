'use strict';

var express = require('express');
var timeout = require('connect-timeout');
var path = require('path');
var bodyParser = require('body-parser');
var AV = require('leanengine');
var expressWs = require('express-ws');

// 加载云函数定义，你可以将云函数拆分到多个文件方便管理，但需要在主文件中加载它们
require('./cloud');

var app = express();

// 启用 WebSocket 支持，如不需要可去除
expressWs(app);

// 设置模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/static', express.static('public'));

// 设置默认超时时间
app.use(timeout('15s'));

// 加载云引擎中间件
app.use(AV.express());

// 强制使用 https
app.enable('trust proxy');
app.use(AV.Cloud.HttpsRedirect());

// 加载 cookieSession 以支持 AV.User 的会话状态
app.use(AV.Cloud.CookieSession({ secret: 'randomString', maxAge: 3600000, fetchUser: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 可以将一类的路由单独保存在一个文件中
app.use('/batch-update', require('./routes/batch-update'));
app.use('/cloud-queue', require('./routes/cloud-queue'));
app.use('/crawler', require('./routes/crawler'));
app.use('/imagemagick', require('./routes/imagemagick'));
app.use('/long-running', require('./routes/long-running'));
app.use('/todos', require('./routes/todos'));
app.use('/users', require('./routes/users'));
app.use('/websocket', require('./routes/websocket'));
app.use('/wechat', require('./routes/wechat-message-callback'))
app.use('/xml', require('./routes/xml'));

app.use('/lean-cache', require('./lean-cache'));

app.get('/', function(req, res) {
  res.redirect('/todos');
});

app.use(function(req, res, next) {
  // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器
  if (!res.headersSent) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
});

// error handlers
app.use(function(err, req, res, _next) {
  if (req.timedout && req.headers.upgrade === 'websocket') {
    // 忽略 websocket 的超时
    return;
  }

  var statusCode = err.status || 500;
  if (statusCode === 500) {
    console.error(err.stack || err);
  }
  if (req.timedout) {
    console.error('请求超时: url=%s, timeout=%d, 请确认方法执行耗时很长，或没有正确的 response 回调。', req.originalUrl, err.timeout);
  }
  res.status(statusCode);
  // 默认不输出异常详情
  var error = {};
  if (app.get('env') === 'development') {
    // 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
    error = err;
  }
  res.render('error', {
    message: err.message,
    error: error
  });
});

module.exports = app;
