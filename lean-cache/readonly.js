var AV = require('leanengine');
var _ = require('underscore');

var router = require('express').Router();
var redisClient = require('../redis').redisClient;
var Category = AV.Object.extend('Category');

/*
 * 热点只读数据缓存示例
 *
 * 在系统中有些数据是需要非常频繁地读取的，但这些数据量很小而且不常修改，比较适合整个放到 LeanCache 中
 *
 * 在这个示例中我们以缓存一个电商网站的商品分类信息为例。
 */

/* 设置特定分类的信息，如不存在会新建，会触发 afterSave 或 afterUpdate 的 Hook */
router.put('/:name', function(req, res, next) {
  req.body.name = req.params.name;

  new AV.Query(Category).equalTo('name', req.params.name).first().then(function(category) {
    if (category) {
      return category.save(req.body);
    } else {
      return new Category().save(req.body);
    }
  }).catch(function(err) {
    if (err.code == 101) { // Class or object doesn't exists.
      return new Category().save(req.body);
    } else {
      throw err;
    }
  }).then(function(category) {
    res.json(category);
  }).catch(next);
});

/* 从 Redis 中获取分类信息，不会查询云存储 */
router.get('/', function(req, res, next) {
  redisClient.hgetall('categories').then(function(categories) {
    res.json(_.map(categories, JSON.parse));
  }).catch(next);
});

/* Redis 中的数据是通过下面三个 Class Hook 来和云存储保持同步的 */
AV.Cloud.afterUpdate('Category', function(request) {
  redisClient.hset('categories', request.object.get('name'), request.object.toFullJSON()).catch(function(err) {
    console.error(err.stack);
  });
});

AV.Cloud.afterSave('Category', function(request) {
  redisClient.hset('categories', request.object.get('name'), request.object.toFullJSON()).catch(function(err) {
    console.error(err.stack);
  });
});

AV.Cloud.afterDelete('Category', function(request) {
  redisClient.hdel('categories', request.object.get('name')).catch(function(err) {
    console.error(err.stack);
  });
});

/* 我们还可以设置一个一天的定时器，每天与云存储进行一次全量的同步，以免错过某个 Class Hook */
AV.Cloud.define('refreshCategories', function(request, response) {
  new AV.Query(Category).find().then(function(categories) {
    return redisClient.hmset('categories', _.mapObject(_.indexBy(categories, function(category) {
      return category.get('name');
    }), object => object.toFullJSON())).then(function() {
      response.success();
    });
  }).catch(function(err) {
    response.error(err);
  });
});

module.exports = router;
