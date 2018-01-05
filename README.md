# LeanEngine Node.js Demos

该项目是 [LeanEngine](https://leancloud.cn/docs/leanengine_overview.html) Node.js 项目的代码合集，包括了推荐的最佳实践和常用的代码片段，每个文件中都有较为详细的注释。适合云引擎的开发者阅读、参考，也可以将代码片段复制到你的项目中使用。

若希望从一个更精简的项目骨架开始开发你的新项目，请使用 [leancloud/node-js-getting-started](https://github.com/leancloud/node-js-getting-started)。

## LeanCache 示例

`redis.js` 使用了 [ioredis](https://github.com/luin/ioredis) 这个库来连接到 Redis, 并导出一个默认的 `redisClient` 供具体业务逻辑使用。

- 关联数据缓存（`lean-cache/associated-data`）：缓存一些数据量少、查询频繁、不常修改、关联结构复杂的关联数据。
- 图形验证码（`lean-cache/captcha`）：利用图形验证码保护短信发送接口。
- 排行榜缓存（`lean-cache/leaderboard`）：维护一个用户游戏分数的排行榜，并在次日将榜单归档到云存储中。
- 发布/订阅（`lean-cache/pubsub`）：使用 Redis 来实现发布/订阅模式。
- 热点只读数据缓存（`lean-cache/readonly`）：将几乎只读的配置（例如购物网站的商品分类信息）通过 Class Hook 缓存在 Redis。
- 节点选举和锁（`lean-cache/redlock`）：多个任务共同竞争一个资源（锁），确保同一时间只有一个任务能够在执行（持有这个锁）。
- 任务队列（`lean-cache/task-queue`）：保证大量任务以指定的并发数量顺序地执行，以减少对其他服务的压力。

本地运行 Redis:

* Mac 运行 `brew install redis` 安装，然后用 `redis-server` 启动。
* Debian/Ubuntu 运行 `apt-get install redis-server`, CentOS/RHEL 运行 `yum install redis`.
* Windows 尚无官方支持，可以下载 [微软的分支版本](https://github.com/MSOpenTech/redis/releases) 安装包。

## 网站托管示例

- 批量更新（`routes/batch-update`）：根据一定条件批量更新大量的对象。
- 短信图形验证码（`routes/captcha`）：要求用户先正确填写一个图形验证码，再发送短信。
- 延时和重试（`routes/delay-and-retry`）：使用云函数的任务队列功能执行延时任务、在失败时重试。
- 图片处理（`routes/imagemagick`）：使用 imagemagick 对图片进行简单的处理。
- 元信息（`routes/meta`）：从运行环境或客户端获元信息。
- Todo List（`routes/todos`）：基于云存储实现数据的增、删、改、查，并使用 ACL 来保护数据。
- 用户系统（`routes/users`）：基于云存储实现用户的注册、登录、登出。
- WebSocket（`routes/websocket`）：基于 WebSocket 实现实时的数据传输。
- 微信公众号（`routes/wecaht`）：微信公众号聊天机器人，文档见 [微信公众平台开发指南](https://leancloud.cn/docs/webhosting_weixin.html) 。
- XML（`routes/xml`）：生成 XML。

## 云函数示例

云函数示例都位于 `cloud.js`，详见其中的注释。

## 本地运行

首先确认本机已经安装 [Node.js](http://nodejs.org/) 运行环境和 [LeanCloud 命令行工具](https://leancloud.cn/docs/leanengine_cli.html)，在 LeanCloud 控制台上创建一个应用，执行下列命令：

```
git clone https://github.com/leancloud/leanengine-nodejs-demos.git
cd leanengine-nodejs-demos
npm install
lean login
lean switch
lean up
```

应用成功启动后可访问 [localhost:3000](http://localhost:3000) 访问。

## 部署到 LeanEngine

部署到预备环境（若无预备环境则直接部署到生产环境）：
```
lean deploy
```

将预备环境的代码发布到生产环境：
```
lean publish
```

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
