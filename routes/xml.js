var Router = require('express').Router;
var AV = require('leanengine');

var router = new Router();

router.get('/xml2js-build-object', function(req, res) {
  var xml2js = require('xml2js');
  var builder = new xml2js.Builder();

  var data = {
    xml: {
      ToUserName: 'leancloud',
      FromUserName: 'guest',
      CreateTime: 1462767983071,
      MsgType: 'text',
      Content: '谢谢你，第44位点赞者！'
    }
  };

  var xml = builder.buildObject(data);
  res.send(xml);
});

module.exports = router;
