# 错误处理机制

## 错误处理

::: tip
编程语言或者计算机硬件里的一种机制，处理软件或者信息系统中出现的异常状况
:::

* 运行时错误，都返回500
* 逻辑错误，如找不到（404），先决条件失败（412），无法处理的实体（参数格式不对，422）等
* 防止程序挂掉
* 告知用户错误信息
* 便于开发调试

---

## 自定义错误处理中间件

```js
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || err.statusCode || 500;
        ctx.body = {
            message: err.message
        }
    }
})
```

---

## 使用koa-json-error进行错误处理

* 安装koa-json-error
* 使用koa-json-error的默认配置处理错误
* 修改配置使其在生产环境下禁用错误堆栈的返回
* 写在所有中间件前

```js
const error = require('koa-json-error');
app.use(error({
    // 设置报错信息中的stack不在生产环境返回，只在测试环境返
    postFormat: (e, { stack, ...rest }) =>
    process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}));
```

---

## 使用koa-parameter校验参数

* 安装koa-parameter
* 使用koa-parameter校验参数
* 制造422错误来测试校验结果

```js
npm i koa-parameter --save

const parameter = require('koa-parameter');

router.post('/', (ctx) => {
    ctx.verifyParams({
        name: { type: 'string', required: true },
        age: { type: "number", required: false }
    })
    const data = db.data.push(ctx.request.body)
    ctx.body = {
        data: [
            ctx.request.body
        ]
    }
});

app.use(bodyparser());
app.use(parameter(app)); // 放在请求体之后，可以在ctx中加入一个方法帮助校验参数，所以将app传入
```
