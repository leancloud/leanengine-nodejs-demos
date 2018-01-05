var Router = require('express').Router;
var gm = require('gm').subClass({imageMagick: true});

var router = new Router();

router.get('/resize', function(req, res) {
  gm('public/leanstorage.png').resize(547, 463).stream('png').on('error', console.error).pipe(res);
});

module.exports = router;
