# RESTFull 最佳实践

## 嵌套路由

::: tip
有时路由涉及到很多业务模块，可能需要对模块进行拆分和嵌套，koa-router 提供了路由嵌套的功能，使用也很简单，就是创建两个 Router 实例，然后将被嵌套的模块路由作为父级路由的中间件使用
:::

```js
const Router = require('koa-router');
const router = new Router({ 'prefix': '/questions/:questionId/answer' });
```

通过 answerSchema 的设计,设计 questionId 字段，实现一个问题 id 对应多个答案， 多个答案也可以映射一个问题，实现一对多的关系。

```js
const answerSchema = new Schema({
    __v: { type: Number, select: false },
    content: { type: String, required: true },
    answerer: { type: Schema.Types.ObjectId, ref: 'User', required: true, select: false },
    // 用 questionId 表示从属于某一个问题
    questionId: { type: String, required: true },
})

//  新增相关 问题（questionId）的回答，通过 token 绑定 answer
POST axios.post('localhost:3001/questions/5feae88fc9a2196eb54cdc66/answer');

// 获取特定 问题（questionId）的回答
GET axios.get('localhost:3001/questions/5feae88fc9a2196eb54cdc66/answer/问题id);

[
    {
        "_id": "5fed44531832d12d63499bd2",
        "content": "简单的说 Node.js 就是运行在服务端的 JavaScript",
        "questionId": "5feae88fc9a2196eb54cdc66"
    },
    {
        "_id": "5fed450b1832d12d63499bd3",
        "content": "Node.js 是一个基于Chrome JavaScript 运行时建立的一个平台",
        "questionId": "5feae88fc9a2196eb54cdc66"
    }
]

// 获取特定 问题（questionId）的特定回答相关所有属性
GET axios.get('localhost:3001/questions/5feae88fc9a2196eb54cdc66/answer/问题id);

{
    "_id": "5fed44531832d12d63499bd2",
    "content": "简单的说 Node.js 就是运行在服务端的 JavaScript",
    "answerer": {
        "gender": "male",
        "_id": "5fe59742e7d610dcfaba571f",
        "name": "李雷"
    },
    "questionId": "5feae88fc9a2196eb54cdc66"
}

// 修改相关 问题（questionId）的特定回答
PATCH axios.patch('localhost:3001/questions/5feae88fc9a2196eb54cdc66/answer/问题id);

```

## 互斥接口

将控制器看作是一个中间件，以赞和踩为互斥关系为例

```js
// 赞 添加 next 使其成为中间件
async likeAnswer(ctx, next) {
    const id = ctx.params.id;
    const me = await User.findById(ctx.state.user._id).select('+likeingAnswers');
    if (!me.likeingAnswers.map(id => id.toString()).includes(id)) {
        me.likeingAnswers.push(id);
        me.save();
        await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } });
    }
    ctx.status = 204;
    await next();
}
// 踩 添加 next 使其成为中间件
async disLikeAnswer(ctx, next) {
    const id = ctx.params.id;
    const me = await User.findById(ctx.state.user._id).select('+disLikeingAnswers');
    if (!me.disLikeingAnswers.map(id => id.toString()).includes(id)) {
        me.disLikeingAnswers.push(id);
        me.save();
    }
    ctx.status = 204;
    await next();
}

// 点赞某个问题的时候，执行踩取消的操作
router.put('/likeingAnswer/:id', auth, checkAnswerExist, likeAnswer, unDisLikeAnswer);
// 点踩某个问题的时候，执行赞取消的操作
router.put('/disLikeingAnswer/:id', auth, checkAnswerExist, disLikeAnswer, unLikeAnswer);
```

---

## RESTful API最佳实践

::: tip
使用资源名词而不是动词实现RESTful API
:::
为了易于理解，为资源使用下面的API结构：

| Resource        | Getread           | Postcreate | Putupdate | Delete |
| :-------------: |:-------------:| :-----:| :-----:| :------------:|
| /answer | 返回一个answer的列表 | 创建一个新的answer | 更新answer的信息 | 删除所有的answer |
| /answer/2 | 返回指定的answer | Method not allowed(405) | 更新指定的 | answer的信息 |

```js
// 不要使用动词
/getAnswer
/createAnswer
/deleteAnswer

const router = new Router({ 'prefix': '/questions/:questionId/answer' })

// 使用名词 answer
router.get('/', find);
router.get('/:id', checkAnswerExist, findById);
router.post('/', auth, create);
router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update);
router.delete('/:id', auth, checkAnswerExist, checkAnswerer, del);
```

::: tip
Get方法和查询参数不应该改变资源状态
:::
使用Put,Post和Delete方法替代Get方法来改变资源状态。不要使用Get来使状态改变

```js
GET /questions/4?answer or
GET /questions/4/answer
```

::: tip
使用名词的复数形式
:::
不要混合使用单数和复数形式，而应该为所有资源一直保持使用复数形式：

```js
/users instead of /user
/questions instead of /question
/comments instead of /comment
```

::: tip
为关系使用子资源
:::
假如资源连接到其它资源，则使用子资源形式：

```js
// 返回4号问题的答案列表
/questions/4/answers
// 返回4号问题的 id 为 11的答案
/questions/4/answers/11
```

::: tip
使用HTTP头决定序列化格式
:::
在客户端和服务端都需要知道使用什么格式来进行通信，这个格式应该在HTTP头中指定:

* Content-Type：定义请求的格式；
* Accept ：定义允许的响应格式的列表

::: tip
使用HATEOAS
:::
Hypermedia as the Engine of Application State是一个指导原则，它规定超文本链接应该被用于在API中创建更好的资源导航：

```js
{
  "id": 711,
  "manufacturer": "bmw",
  "model": "X5",
  "seats": 5,
  "drivers": [
   {
    "id": "23",
    "name": "Stefan Jauker",
    "links": [
     {
     "rel": "self",
     "href": "/api/v1/drivers/23"
    }
   ]
  }
 ]
}
```

::: tip
为集合提供过滤、排序、字段选择以及分页
:::

```js
**过滤**
为所有字段或者查询语句提供独立的查询参数：
// 返回一个包含真不错的问题列表
GET /questions?q='真不错'
// 返回最多2个回答的问题列表
GET /questions/4?answers<=2

**排序**
允许跨越多字段的正序或者倒序排列：
GET /questions?sort=-manufactorer,+model

**字段选择**
一些情况下，我们只需要在列表中查询几个有标识意义的字段，我们不需要从服务端把所有字段的值都请求出来，所以需要支持API选择查询字段的能力，这也可以提到网络传输性能和速度：
GET /questions/4?fields=title;description;questioner;topics

**分页**
使用page和per_page来获取固定数量的资源结果，当其中一个参数没有出现时，应该提供各自的默认值，比如默认取第一页，或者默认取20条数据：
GET /users?page=1&per_page=10
GET /users?&per_page=10 // 得到第一页的结果
GET /users?&page=2  // 得到前20个结果

使用自定义的头X-Total-Count发回给调用段实际的资源数量。

前一页后一页的链接也应该在HTTP头链接中得到支持，遵从下文中的链接原则而不要构建你自己的头

Link: <https://github/api/v1/cars?per_page=15&page=5>; rel="next",
<https://github/api/v1/cars?per_page=50&page=3>; rel="last",
<https://github/api/v1/cars?per_page=0&page=5>; rel="first",
<https://github/api/v1/cars?per_page=5&page=5>; rel="prev"

**版本化你的API**
确保强制实行API版本，并且不要发布一个没有版本的API，使用简单的序列数字，避免使用2.5.0这样的形式：

/blog/api/v1

**使用HTTP状态码处理错误**
忽略错误处理的API是很难使用的，简单的返回500和调用堆栈是非常不友好也非常无用的：

/使用HTTP状态码/

HTTP标准提供了70多个状态码来描述返回值，我们不需要完全用到他们，下文中列出10个使用率较高的：

200 – OK – 一切正常
201 – OK – 新资源已经被创建
204 – OK – 资源删除成功

304 – 没有变化，客户端可以使用缓存数据

400 – Bad Request – 调用不合法，确切的错误应该在error payload中描述，例如：“JSON 不合法 ”
401 – 未认证，调用需要用户通过认证
403 – 不允许的，服务端正常解析和请求，但是调用被回绝或者不被允许
404 – 未找到，指定的资源不存在
422 – 不可指定的请求体 – 只有服务器不能处理实体时使用，比如图像不能被格式化，或者重要字段丢失。

500 – Internal Server Error – 标准服务端错误，API开发人员应该尽量避开这种错误

/使用 error payloads/
所有的异常都应该被映射到error payloads中，下文中的例子是一个json payload的模板：
{
  "errors": [
   {
    "userMessage": "Sorry, the requested resource does not exist",
    "internalMessage": "No car found in the database",
    "code": 34,
    "more info": "http://dev.mwaysolutions.com/blog/api/v1/errors/12345"
   }
  ]
}
```

::: tip
允许重写HTTP方法
:::
一些代理只支持GET和POST方法，为了在这种限制下支持RESTful API，API需要重写HTTP方法。

使用自定义的X-HTTP-Method-Override  HTTP头来重写POST方法。

---

## 分页设计、模糊搜索、多字段模糊搜索实践

```js
// 如果你需要在MongoDB中读取指定数量的数据记录
// 例如： 通过 imit()方法接受一个数字参数，该参数指定从MongoDB中读取的记录条数。
// kip()方法来跳过指定数量的数据，skip方法同样接受一个数字参数作为跳过的记录条数。
const { q, page = 1, per_page = 10 } = ctx.query;
const pageSize = Math.max(page * 1, 1) - 1;
const perPage = Math.max(per_page * 1, 1);

User.find({ content: q }).limit(perPage).skip(pageSize * perPage)

// 通过正则表达式 new RegExp 平匹配字符串
const keyword = new RegExp(q);
User.find({ content: keyword }).limit(perPage).skip(pageSize * perPage)

// 多字段模糊匹配 $or
const keyword = new RegExp(q);
User.find({ $or: [
    { title: keyword },
    { description: keyword }
]}).limit(perPage).skip(pageSize * perPage)
```
