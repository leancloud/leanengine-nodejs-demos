var request = require('request-promise');
var cheerio = require('cheerio');
var AV = require('leanengine');
var {URL} = require('url');

var {redisClient} = require('../redis');

var router = require('express').Router();

var CrawlerResults = AV.Object.extend('CrawlerResults');

/*
 * 爬虫示例
 *
 * 在这个例子中我们实现了一个简单的爬虫来抓取 LeanCloud 的文档页面，
 * 云函数 crawling 是抓取的主要逻辑，它会将结果保存到云存储（CrawlerResults）中、
 * 继续将页面中的链接通过 queuePage 函数来加入队列，
 * queuePage 会用 Redis 来保证抓取的唯一性，避免反复抓取同一页面。
 *
 * 这样每次抓取页面都是一次云函数调用，即使要抓取的页面的量非常大也不会有超时或中断的问题，
 * 如果发生了意外的错误，队列还会进行三次重试。
 */

router.post('/start', function(req, res, next) {
  AV.Cloud.enqueue('crawling', {
    url: 'https://leancloud.cn/docs/'
  }).then( () => {
    res.sendStatus(204);
  }).catch(next);
});

AV.Cloud.define('crawling', function(req) {
  const {url, referer} = req.params;

  return request(url).then( result => {
    var $ = cheerio.load(result);

    new CrawlerResults().save({
      url: url,
      referer: referer,
      title: $('title').text()
    });

    getPageUrls($, url).forEach( subUrl => {
      if (subUrl.host === 'leancloud.cn' && subUrl.pathname.startsWith('/docs/')) {
        queuePage(subUrl, url);
      }
    });
  }).catch( err => {
    if (err.message.startsWith('404')) {
      console.error(`crawling ${url} failed:`, err.message, 'referer:', referer);
    } else {
      throw err;
    }
  });
});

function queuePage(url, referer) {
  url.hash = '';
  url.protocol = 'https';

  redisClient.set(`crawled:${url.href}`, 1, 'EX', 3600, 'NX').then( ok => {
    if (ok) {
      AV.Cloud.enqueue('crawling', {
        url: url.href,
        referer: referer
      }).catch(console.error);
    }
  });
}

function getPageUrls($, url) {
  return $($('a')).map( (index, link) => {
    return new URL($(link).attr('href'), url);
  }).toArray();
}

module.exports = router;
