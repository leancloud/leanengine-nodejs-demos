# LeanEngine Node.js Demos

该项目是 [LeanEngine](https://leancloud.cn/docs/leanengine_overview.html) Node.js 项目的常用功能和示例仓库。包括了推荐的最佳实践和常用的代码片段，每个文件中都有较为详细的注释，适合云引擎的开发者阅读、参考，也可以将代码片段复制到你的项目中使用。

若希望从一个更精简的项目骨架开始开发你的新项目，请使用 [leancloud/node-js-getting-started](https://github.com/leancloud/node-js-getting-started)。

> 该项目还在梳理的过程中，仍剩余一些 Demo 或文件没有整理完成。

## 功能列表（云函数）

下面列出的功能均以云函数实现，位于 `functions` 目录中。每个文件的开头已列出所需的依赖和配置（环境变量），你可以在安装依赖后将文件直接复制到你的 `functions` 目录中，我们的示例项目会自动加载这个目录中的文件。

对于需要 LeanCache 的功能，还请阅读下面的 [LeanCache](#LeanCache) 段落。

| 文件名       | 提供的云函数 | 介绍 |
| ------------ | ------------ | ---- |
| [captcha-storage.js](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/functions/captcha-storage.js) | getCaptchaImageStorage<br>requestMobilePhoneVerifyStorage | ✅ 使用图形验证码限制短信接口（使用云存储后端）。  |
| [captcha-cache.js](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/functions/captcha-cache.js) | getCaptchaImageCache<br>requestMobilePhoneVerifyCache | 使用图形验证码限制短信接口（使用 LeanCache）（需要 LeanCache）。  |
| [leaderboard.js](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/functions/leaderboard.js) | submitHighest<br>getRankRange<br>getScoreRange<br>getRankAndScore<br>archiveLeaderboard | 使用 LeanCache 实现排行榜，支持任意数量的用户排序、支持查询任意用户的排名、支持查询任意排名段的用户（需要 LeanCache）。  |
| [meta.js](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/functions/meta.js) | getEnvironments<br>getUser<br>getParams<br>getClientMeta<br>getHeaders | 从运行环境或客户端读取元信息（环境变量、请求头等）。 |
| [batch-update.js](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/functions/batch-update.js) | batchUpdateByQuery<br>batchUpdateAll | 批量更新数据示例。 |
| [imagemagick.js](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/functions/imagemagick.js) | imageMagicResize | ✅ 使用 imageMagick 处理图像。 |
| [crawler.js](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/functions/crawler.js) | crawlWebsite<br>crawling | 爬虫示例，使用 Cloud Queue 抓取一个站点下的所有网页。 |
| [xml.js](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/functions/xml.js) | xmlBuildObject | 使用云函数序列化 XML 对象。 |

## 功能列表（网站托管）

下面列出的功能位于 `routes` 目录。每个文件的开头已列出所需的依赖和配置（环境变量），有些功能需要额外的配置，请阅读文件开头的说明，你可以在安装依赖后将文件直接复制到你的 `routes` 目录中，然后在 `app.js` 中引用，例如：

```javascript
app.use('/wechat', require('./routes/wechat-message-callback'))
```

| 文件名        | 介绍 |
| ------------  | ---- |
| [wechat-message-callback.js](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/routes/wechat-message-callback.js) | 接收并自动回复 [微信公众平台的用户消息回调](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140543)  |

## 其他 Demo

还有一些功能相对完备的 Demo 被制作成了独立的应用：

| Demo 地址        | 代码地址 | 介绍 |
| ------------  | ---- | ---- |
| [snapcat.leanapp.cn](https://snapcat.leanapp.cn/?url=https://leancloud.cn/docs) | [snapcat 分支](https://github.com/leancloud/leanengine-nodejs-demos/tree/snapcat) | 一个使用 chrome-headless 的截图服务。 |

## 脚本

这些工具脚本位于 `bin` 目录：

| 文件名        | 使用方法 | 介绍 |
| ------------  | ---- | ---- |
| [load-test](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/bin/load-test.js) | `load-test 30` | 对自定义的代码片段进行压力测试的工具，会给出速率和耗时等统计数据。 |

## 使用 LeanCache

对于用到了 LeanCache 的功能，你需要在控制台上创建 LeanCache 实例，复制该项目根目录的 [redis.js](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/redis.js) 到你的项目，并修改其中的 LeanCache 名称。

本地运行 Redis:

* Mac 运行 `brew install redis` 安装，然后用 `redis-server` 启动。
* Debian/Ubuntu 运行 `apt-get install redis-server`, CentOS/RHEL 运行 `yum install redis`.
* Windows 尚无官方支持，可以下载 [微软的分支版本](https://github.com/MicrosoftArchive/redis) 安装包。

## 相关文档

* [云引擎总览](https://leancloud.cn/docs/leanengine_overview.html)
* [云函数开发指南](https://leancloud.cn/docs/leanengine_cloudfunction_guide-node.html)
* [网站托管开发指南](https://leancloud.cn/docs/leanengine_webhosting_guide-node.html)
* [JavaScript 开发指南](https://leancloud.cn/docs/leanstorage_guide-js.html)
* [JavaScript SDK API](https://leancloud.github.io/javascript-sdk/docs/)
* [Node.js SDK API](https://github.com/leancloud/leanengine-node-sdk/blob/master/API.md)
* [命令行工具使用指南](https://leancloud.cn/docs/leanengine_cli.html)
* [LeanCache 使用指南](https://leancloud.cn/docs/leancache_guide.html)
* [云引擎常见问题和解答](https://leancloud.cn/docs/leanengine_faq.html)
