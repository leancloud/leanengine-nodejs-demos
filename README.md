# LeanEngine Node.js Todo Demo

该项目是 [LeanCloud](https://leancloud.cn/) 的 [LeanEngine](https://leancloud.cn/docs/leanengine_overview.html) 示例项目，使用 Node.js 和 Express 实现。

在 [这里](https://todo-demo.leanapp.cn/todos) 可以在线体验。

## 功能

* 用户会话管理:注册、登录、登出
* 业务数据的 CRUD：Todo 的创建和删除、条件查询、状态修改等。
* 简单的 ACL：不能修改别人创建 Todo 的状态。

## 本地开发调试

首先确认本机已经安装 [Node.js](http://nodejs.org/) 运行环境和 [LeanCloud 命令行工具](https://www.leancloud.cn/docs/leanengine_cli.html)，然后执行下列指令来检出项目：

```
$ git clone https://github.com/leancloud/leanengine-todo-demo.git
$ cd leanengine-todo-demo
```

安装依赖：

```
$ npm install
```

关联应用：

```
lean app add origin <appId>
```

这里的 appId 填上你在 LeanCloud 上创建的某一应用的 appId 即可。

启动项目：

```
lean up
```

恭喜你，启动成功！使用 [http://localhost:3000/todos](http://localhost:3000/todos) 体验项目。

## 部署到 LeanEngine

部署到预备环境（若无预备环境则直接部署到生产环境）：
```
lean deploy
```

将预备环境的代码发布到生产环境：
```
lean publish
```
