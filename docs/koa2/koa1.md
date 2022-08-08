# Koa介绍

## Koa的概念和使用

::: tip
基于Node.js的下一代Web框架
:::

* Node.js模块
* 蚕食第一代Web框架Express的市场
* 不是命令行工具、不是算法,用于Web开发
* 由Express幕后原班人马打造
* Web应用和API开发领域
* 更小、更富有表现力、更健壮
* 利用async函数，丢弃回调函数
* 增强错误处理：try catch
* 没有捆绑任何中间件

```js
// 初始化 node
npm init

npm install koa

const Koa = require('koa')
const app = new Koa()


app.use( async ( ctx ) => {
  ctx.body = 'hello koa2'
})


app.listen(3000)
console.log('[demo] start-quick is starting at port 3000')

```

::: tip
nodemon 可以自动重启node项目
:::

## Koa中间件和洋葱模型

### 中间件

::: tip
中间件就是普通的函数，该函数接收两个参数：context 和 next。其中 context 表示上下文对象，而 next 表示一个调用后返回 Promise 对象的函数对象。
:::

* 创建 Koa 应用程序对象之后，就可以通过调用该对象的 use 方法来注册中间件
* 通过把前置处理器和后置处理器分别放到 await next() 语句的前后来完成任务编排

### 洋葱模型

![An image](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X3BuZy9qUW13VElGbDFWMlZLaWNXb3pCQU9hYlNSZGljbzl1VEYwY3JObzA1djZHeHdZNGNLa0ZYbFRVa0RjUGljeTlZWk1YY2hPcFBjV3Y1azlhaFo4RjMyU1IzUS82NDA?x-oss-process=image/format,png)

* 洋葱内的每一层都表示一个独立的中间件，用于实现不同的功能
* 每次请求都会从左侧开始一层层地经过每层的中间件，当进入到最里层的中间件之后，就会从最里层的中间件开始逐层返回
* 对于每层的中间件来说，在一个 请求和响应 周期中，都有两个时机点来添加不同的处理逻辑。

```js
app.use((ctx,next) => {
    console.log(1);
    next();
    console.log(2);
})

app.use(async (ctx,next) => {
    console.log(3);
    const res = await axios.get('http://github.com/api');
    next();
    console.log(4);
})
```

上面js的执行结果为 1 3 2 4，事实上我们的期望结果为1 3 4 2，因为第二个中间件中的 await 会造成线程阻塞，因此会造成 1 3 2 4 的结果，

```js
app.use(async (ctx,next) => {
    console.log(1);
    await next();
    console.log(2);
})

app.use(async (ctx,next) => {
    console.log(3);
    const res = await axios.get('http://github.com/api');
    next();
    console.log(4);
})
```

此时**使用 async await 保持中间件按照洋葱模型顺序加载执行**，要在每一个中间件调用下一个中间件时，每个 next 前面保证有 await 关键字，中间件就会按照洋葱模型的顺序执行。