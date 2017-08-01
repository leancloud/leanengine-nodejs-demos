# LeanEngine Node.js Demos

该项目是 [LeanEngine](https://leancloud.cn/docs/leanengine_overview.html) Node.js 项目的代码合集，包括了推荐的最佳实践和常用的代码片段。适合云引擎的开发者阅读、参考，也可以将代码片段复制到你的项目中使用。

若希望从一个项目骨架开始开发你的新项目，请使用 [leancloud/node-js-getting-started](https://github.com/leancloud/node-js-getting-started)。

## 功能目录

* 用户会话管理:注册、登录、登出
* 业务数据的 CRUD：Todo 的创建和删除、条件查询、状态修改等。
* 简单的 ACL：不能修改别人创建 Todo 的状态。

## 本地运行

首先确认本机已经安装 [Node.js](http://nodejs.org/) 运行环境和 [LeanCloud 命令行工具](https://leancloud.cn/docs/leanengine_cli.html)，然后执行下列指令：

```
$ git clone https://github.com/leancloud/node-js-getting-started.git
$ cd node-js-getting-started
```

安装依赖：

```
npm install
```

登录并关联应用：

```
lean login
lean switch
```

启动项目：

```
lean up
```

之后你就可以在 [localhost:3000](http://localhost:3000) 访问到你的应用了。

## 部署到 LeanEngine

部署到预备环境（若无预备环境则直接部署到生产环境）：
```
lean deploy
```

## 相关文档

* [云函数开发指南](https://leancloud.cn/docs/leanengine_cloudfunction_guide-node.html)
* [网站托管开发指南](https://leancloud.cn/docs/leanengine_webhosting_guide-node.html)
* [JavaScript 开发指南](https://leancloud.cn/docs/leanstorage_guide-js.html)
* [JavaScript SDK API](https://leancloud.github.io/javascript-sdk/docs/)
* [Node.js SDK API](https://github.com/leancloud/leanengine-node-sdk/blob/master/API.md)
* [命令行工具使用指南](https://leancloud.cn/docs/leanengine_cli.html)
* [云引擎常见问题和解答](https://leancloud.cn/docs/leanengine_faq.html)
