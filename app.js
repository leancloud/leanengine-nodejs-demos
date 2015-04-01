var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var todos = require('./routes/todos');
var functions = require('./functions');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(functions);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 可以将一类的路由单独保存在一个文件中
app.use('/todos', todos);

// 一个简单的路由，测试应用的最基本功能
app.get('/hello', function (req, res) {
  res.send('Hello World!');
});

/**
 * 健康监测
 * 建议保留该方法，我们会通过该方法判断服务是否正常运行。
 * 该方法如果调用 res.success() 即健康监测成功，res.error() 即为失败，
 * 或者超过 5 秒没有响应也算失败。
 */
app.get('/1/ping', function (req, res) {
  // 可以在这里根据需要增加一些状态监测的逻辑，但检测耗时不要超过 5 秒。
  // 如果监测逻辑时异步的，则需要在回调内调用 res.success() 或者 res.error()
  res.send('pong');
})

// 端口一定要从环境变量 `LC_APP_PORT` 中获取。
// 云代码运行时会分配端口并赋值到该变量。
var port = process.env.LC_APP_PORT || 3000
var server = app.listen(port, function () {
  console.log('TODO demo started.');
});
