var AV = require('leanengine');
var express = require('express');
var Promise = require('bluebird');

var router = express.Router();

var Post = AV.Object.extend('Post');

/*
 * 批量更新数据示例
 *
 * LeanCloud 只提供了更新单个对象的能力，因此在需要批量更新大量对象时，我们需要先找出需要更新的对象，再逐个更新。
 *
 * 下面提供了两种更新的方式，你可以直接将这两个工具函数复制到你的项目使用：
 * - `batchUpdateByQuery`: 通过一个查询来找到需要更新的对象（例如我们要把 status 字段从 a 更新到 b，那么我们就查询 status == a 的对象），
 *                         这种情况下需要保证未更新的对象一定符合这个查询、已更新的对象一定不符合这个查询，否则可能会出现遗漏或死循环。
 * - `batchUpdateAll`: 通过 createdAt 从旧到新更新一个数据表中所有的对象，如果中断需要从日志中的上次中断处重新执行（不能从头执行，否则会重复）。
 */

router.post('/by-query/:status?', function(req, res, next) {
  var status = req.params.status || 'a';

  var createQuery = function() {
    return (new AV.Query(Post)).notEqualTo('status', status);
  };

  var performUpdate = function(object) {
    console.log('performUpdate for', object.id);
    object.set('status', status);
    return object.save();
  }

  batchUpdateByQuery(createQuery, performUpdate).then( () => {
    console.log('batch update finished');
    res.send('batch update finished');
  }).catch(next);
});

router.post('/all/:status?', function(req, res, next) {
  var status = req.params.status || 'a';

  var createQuery = function() {
    return new AV.Query(Post);
  };

  var performUpdate = function(object) {
    console.log('performUpdate for', object.id);
    object.set('status', status);
    return object.save();
  }

  batchUpdateAll(createQuery, performUpdate).then( () => {
    console.log('batch update finished');
    res.send('batch update finished');
  }).catch(next);
});

/*
 * batchUpdateByQuery 和 batchUpdateAll 的参数：
 *
 * - `createQuery: function(): AV.Query` 返回查询对象，只有符合查询的对象才会被更新。
 * - `performUpdate: function(object): Promise` 执行更新操作的函数，返回一个 Promise。
 *
 * options:
 *
 * - `batchLimit: number` 每一批次更新对象的数量，默认 1000。
 * - `concurrencyLimit: number` 并发更新对象的数量，默认 3，商用版应用可以调到略低于工作线程数。
 * - `ignoreErrors: boolean`: 忽略更新过程中的错误。
 * - `lastCreatedAt: Date`: 从上次中断时的 createdAt 继续（只适用 batchUpdateAll）。
 *
 * 性能优化建议（数据量大于十万条需要考虑）：
 *
 * - batchUpdateByQuery 的查询需要有索引。
 * - batchUpdateAll 中的查询需要和 createdAt 有复合索引；如果需要排除的对象很少，可以考虑在 performUpdate 中进行过滤，而不是作为一个查询条件。
 */

function batchUpdateByQuery(createQuery, performUpdate, options = {}) {
  var batchLimit = options.batchLimit || 1000;
  var concurrency = options.concurrencyLimit || 3;
  var ignoreErrors = options.ignoreErrors;

  function next() {
    var query = createQuery();

    return query.limit(batchLimit).find().then( results => {
      if (results.length > 0) {
        return Promise.map(results, (object) => {
          return performUpdate(object).catch( err => {
            if (ignoreErrors) {
              console.error('ignored', err);
            } else {
              throw err;
            }
          });
        }, {concurrency}).then(next);
      }
    });
  }

  return next();
}

function batchUpdateAll(createQuery, performUpdate, options = {}) {
  var batchLimit = options.batchLimit || 1000;
  var concurrency = options.concurrencyLimit || 3;
  var ignoreErrors = options.ignoreErrors;

  function next(lastCreatedAt) {
    var query = createQuery();

    if (lastCreatedAt) {
      query.greaterThan('createdAt', lastCreatedAt);
    }

    return query.ascending('createdAt').limit(batchLimit).find().then( results => {
      if (results.length > 0) {
        return Promise.map(results, (object) => {
          return performUpdate(object).catch( err => {
            if (ignoreErrors) {
              console.error('ignored', err);
            } else {
              throw err;
            }
          });
        }, {concurrency}).then( () => {
          nextCreatedAt = results[results.length - 1].createdAt;
          console.log('nextCreatedAt', nextCreatedAt);
          return next(nextCreatedAt);
        });
      }
    });
  }

  return next(options.lastCreatedAt);
}

module.exports = router;
