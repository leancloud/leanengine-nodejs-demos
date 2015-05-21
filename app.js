var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override')
var AV = require('leanengine-sdk');

var users = require('./routes/users');
var todos = require('./routes/todos');
var functions = require('./functions');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/static', express.static('public'));

// 加载云代码方法
app.use(functions);

// 加载 cookieSession 以支持 AV.User 的会话状态
app.use(AV.Cloud.CookieSession({ secret: '05XgTktKPMkU', maxAge: 3600000, fetchUser: true }));

app.use(methodOverride('_method'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 可以将一类的路由单独保存在一个文件中
app.use('/todos', todos);
app.use('/users', users);

app.get('/', function(req, res) {
  res.redirect('/todos');
})

/**
 * 健康监测
 * LeanEngine 会根据 `/1.1/ping` 判断应用是否正常运行。
 * 如果返回状态码为 200 则认为正常。
 * 其他状态码或者超过 5 秒没有响应则认为应用运行异常。
 */
app.get('/1/ping', function(req, res) {
  // 可以在这里根据需要增加一些状态监测的逻辑，但检测耗时不要超过 5 秒。
  // 如果监测逻辑时异步的，则需要在回调内调用 res.send()
  res.send('pong');
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
