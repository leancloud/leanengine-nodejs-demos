var AV = require('leanengine');

AV.init({
  appId: fAiK2likQHlFTeLfvhCgbyKY-gzGzoHsz,
  appKey: QfLVNnnrxogVwOLDIoN0bWqs,
  masterKey: 9l4VTWckkJ9vNPbf2xBulmkf
});

var app = require('./app');

// 端口一定要从环境变量 `LEANCLOUD_APP_PORT` 中获取。
// LeanEngine 运行时会分配端口并赋值到该变量。
var PORT = parseInt(process.env.LEANCLOUD_APP_PORT || 3000);
var server = app.listen(PORT, function () {
  console.log('Node app is running, port:', PORT);
});
