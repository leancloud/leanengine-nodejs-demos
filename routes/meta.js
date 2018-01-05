var Router = require('express').Router;
var _ = require('lodash');

var router = new Router();

router.get('/', function(req, res, next) {
  res.json({
    env: _.mapValues(process.env, function(value, key) {
      if (_.startsWith(key, 'REDIS_URL') || _.includes(['LC_APP_MASTER_KEY'], key)){
        return null;
      } else {
        return value;
      }
    }),

    cwd: process.cwd(),
    execArgv: process.execArgv,
    pid: process.pid,
    arch: process.arch,
    platform: process.platform,
    uid: process.getuid(),
    gid: process.getgid(),
    versions: process.versions
  });

  next();
});

router.get('/headers', function(req, res, next) {
  res.json(req.headers);
});

module.exports = router;
