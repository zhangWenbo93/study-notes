# Koa路由

## Koa路由概念和使用

* 决定了不用URL是如何被不同地执行的
* 在Koa中，路由是一个中间件
* 据不同的URL地址，加载不同的页面实现不同的功能
* 处理不同地HTTP方法
* 可以解析URL上的参数
* 可以安装 koa-router 路由模块来实现路由配置

::: tip
简单的路由配置
:::

```js
    /*app.js*/
    const Koa = require('koa');
    const Router = require('koa-router'); //注意：引入的方式
    const app = new Koa();
    const router = new Router();

    router.get('/', function (ctx, next) {
        ctx.body="Hello koa";
    })
    router.get('/news',(ctx,next)=>{
        ctx.body="新闻page"
    });
    app.use(router.routes()); //作用：启动路由
    app.use(router.allowedMethods());
    /* 作用： 这是官方文档的推荐用法,我们可以看到router.allowedMethods()用在了路由匹配
    router.routes()之后,目的在于：根据ctx.status 设置response 响应头
    */
    app.listen(3000,()=>{
        console.log('starting at port 3000');
    });
```

* 可通过前缀简化路由注册

```js
const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
// 路由前缀
const UserRouter = new Router({ 'prefix': '/users' })

UserRouter.get('/', (ctx) => {
    ctx.body = '用户列表'
});

UserRouter.post('/', (ctx) => {
    ctx.body = '创建用户'
});

UserRouter.get('/:id', (ctx) => {
    ctx.body = '用户Id' + ctx.params.id
});

app.use(router.routes());
app.use(UserRouter.routes());
app.listen(3001)

```

::: tip
路由自动注册
:::

* 方法一

```js
// /router/index
const fs = require('fs');

module.exports = (app) => {
    fs.readdirSync(__dirname).forEach(file => {
        if (file === 'index.js') { return };
        const route = require(`./${file}`);
        app.use(route.routes()).use(route.allowedMethods());
    })
}

// app/index.js
const router = require('./router/index');

router(app);
```

* 方法二

```js
// 使用 require-directory 库

const requireDirectory = require('require-directory');

requireDirectory(module, './app/api', {
    visit: whenLoadModule
})

function whenLoadModule(route) {
    if(route instanceof Router) {
        app.use(route.routes()).use(route.allowedMethods());
    }
}

```

---

## 多中间件功能

* get post方法中可以增加多个中间件进行处理

```js
// 模拟鉴权
const auth = async (ctx, next) => {
    if (ctx.url !== '/users') {
        ctx.throw(401)
    }
    await next();
}

UserRouter.get('/', auth, (ctx) => {
    ctx.body = '用户列表'
});

UserRouter.post('/', auth, (ctx) => {
    ctx.body = '创建用户'
});

UserRouter.get('/:id', auth, (ctx) => {
    ctx.body = '用户Id' + ctx.params.id
});
```

---

## HTTP options方法

* 检测服务器所支持的请求方法
* CORS中的预检请求

## allowedMethods的作用

* 响应options方法,告诉它所支持的请求方法
* 相应的返回405和501

## RESTful API最佳实践

```js

// get 返回列表
UserRouter.get('/', (ctx) => {
    ctx.body = {
        data: [
            { 'name': '张三' },
            { 'name': '李四' },
        ]
    }
});

// get 返回特定用户
UserRouter.get('/:id', (ctx) => {
    ctx.body = {
        data: [
            { 'name': '李四' },
        ]
    }
});

// post 返回新增用户
UserRouter.post('/', (ctx) => {
    ctx.body = {
        data: [
            { 'name': '王五' }
        ]
    }
});

// put 返回被修改的用户
UserRouter.put('/:id', (ctx) => {
    ctx.body = {
        data: [
            { 'name': '张三三' }
        ]
    }
});

// delete 不返回数据，返回204状态码
UserRouter.delete('/:id', (ctx) => {
    ctx.status = 204
});

```
