const _ = require('lodash')
const {URL} = require('url')
const AV = require('leanengine')
const cheerio = require('cheerio')
const crypto = require('crypto')
const memoize = require('promise-memoize')
const requestPromise = require('request-promise')

/*
 * 爬虫示例，使用 Cloud Queue 抓取一个站点下的所有网页
 *
 * 在这个例子中我们实现了一个简单的爬虫来抓取 LeanCloud 的文档页面，
 * 云函数 crawling 是抓取的主要逻辑，它会将结果保存到云存储（CrawlerResults）中、
 * 继续将页面中的链接通过 queuePage 函数来加入队列（将 url 设置为 uniqueId 以免重复抓取）。
 *
 * 这样每次抓取页面都是一次云函数调用，即使要抓取的页面的量非常大也不会有超时或中断的问题，
 * 如果发生了意外的错误，队列还会进行默认的一次重试。
 *
 * 安装依赖：
 *
 *   npm install request-promise cheerio promise-memoize lodash
 */

const CrawlerResults = AV.Object.extend('CrawlerResults')

AV.Cloud.define('crawlWebsite', async request => {
  const startUrl = request.params.startUrl || 'https://leancloud.cn/docs/'
  const urlLimit = request.params.urlLimit || 'https://leancloud.cn/docs/'

  return await queuePage(new URL(startUrl), null, urlLimit)
})

AV.Cloud.define('crawling', async request => {
  const {url, referer, urlLimit} = request.params

  try {
    const $ = cheerio.load(await requestPromise(url))

    await new CrawlerResults().save({
      url: url,
      referer: referer || '',
      title: $('title').text()
    })

    getPageUrls($, url).forEach( subUrl => {
      subUrl.hash = ''
      subUrl.search = ''
      subUrl.protocol = 'https'

      if (subUrl.href.startsWith(urlLimit)) {
        queuePage(subUrl, url, urlLimit).catch( err => {
          if (err.code !== 409) {
            console.log(err)
          }
        })
      }
    })

    return {
      url: url,
      title: $('title').text()
    }
  } catch (err) {
    if (err.message.startsWith('404')) {
      console.error(`crawling ${url} failed:`, err.message, 'referer:', referer)
    } else {
      throw err
    }
  }
})

// 这里用 promise-memoize 添加了一个进程内缓存来减少对 Cloud Queue 的调用次数，
// 但这个缓存并不是必须的，因为 Cloud Queue 本身会根据 uniqueId 去除，
// 因此即使这个程序以多实例运行在云引擎，也不会有问题
const queuePage = memoize(function queuePage(url, referer, urlLimit) {
  return AV.Cloud.enqueue('crawling', {
    url: url.href,
    referer,
    urlLimit
  }, {
    uniqueId: md5(url.href)
  })
}, {maxAge: 60000, maxErrorAge: 60000, resolve: [String, _.noop, _.noop]})

function getPageUrls($, url) {
  return $($('a')).map( (index, link) => {
    return new URL($(link).attr('href'), url)
  }).toArray()
}

function md5(string) {
  return crypto.createHash('md5').update(string).digest('hex')
}
