# TODO Demo

该项目是 [LeanCloud](https://leancloud.cn/) 的 [LeanEngine](https://leancloud.cn/docs/cloud_code_guide.html) 示例项目。
使用 Node.js 运行时。

[这里](http://todo-demo.avosapps.com/todos) 可以体验。

## 功能

* 用户注册
* 用户登录
* 用户会话管理
* 业务数据的 CRUD：TODO 的查询，条件过滤等。
* 简单的 ACL：不能修改别人创建 TODO 的状态。

## 本地开发调试

执行下列代码来迁出项目：
  
```
$ git clone git@github.com:sdjcw/leanengine-todo-demo.git
$ cd leanengine-todo-demo

```

下载依赖包：

```
$ npm install
```

准备启动文件：

```
$ cp start.sh.example start.sh
$ chmod +x start.sh
```

因为开发调试使用了 `supervisor` 来做自动重启，所以你可能需要执行下列命令安装：

```
$ sudo npm install supervisor -g
```

在 LeanCloud 控制台新建项目，并将 `appId`，`appKey`，`masterKey` 填写到 `start.sh` 中。

在 LeanCloud 数据控制台创建数据表 `Todo`。

启动项目：

```
./start.sh
```
你将会看到类似下面的信息：

```
Running node-supervisor with
  program 'server.js'
  --watch '.'
  --extensions 'node,js'
  --exec 'node'

Starting child process with 'node server.js'
Watching directory '/Users/chenwei/workspace/cloudcode-todo-demo' for changes.
TODO demo started.
```

恭喜你，启动成功！使用 [http://localhost:3000/todos](http://localhost:3000/todos) 体验项目。

## 部署到 LeanEngine

首先确认已经安装 [命令行工具](https://leancloud.cn/docs/cloud_code_commandline.html)。

部署到测试环境：

```
$ avoscloud deploy
```

部署到生产环境：

```
$ avoscloud publish
```

