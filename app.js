var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var todos = require('./routes/todos');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 可以将一类的路由单独保存在一个文件中
app.use('/todos', todos);

// 一个简单的路由，测试应用的最基本功能
app.get('/hello', function (req, res) {
  res.send('Hello World!');
});

// 端口一定要从环境变量 `LC_APP_PORT` 中获取。
// 云代码运行时会分配端口并赋值到该变量。
var port = process.env.LC_APP_PORT || 3000
var server = app.listen(port, function () {
  console.log('TODO demo started.');
});
