# Koa JWT认证

## Session

* 相比JWT，最大的优势在于服务端可以主动清除session
* session保存在服务器端，相对较为安全
* 结合cookie使用，较为灵活，兼容性较好
* cookie + session在跨域场景表现不好
* 如果是分布式部署，需要做多级共享session机制
* 基于cookie的机制很容易被CSRF
* 查询session信息可能会有数据库查询操作

---

## JWT

* JSON Web Token 是一个开放标准（RFC 7519）
* 定义了一种紧凑且独立的方式，可以将各方之间的信息作为JSON对象进行安全传输
* 该信息可以验证和信息，因为是经过数字签名的

---

-- 头部（Header）

* typ : token的类型，固定位JWT
* alg : 使用的hash算法（HMAC SHA256 RSA）

-- 有效载荷（Payload）

* 存储需要传递的信息（用户ID、用户名等）
* 包含元数据（过期时间、发布人等）
* 于Header不同，Payload可以加密

-- 签名（Signature）

* 对Header和Payload部分进行签名
* 保证Token在传输的过程中没有被篡改或者损坏

---

## session vs JWT

* 可拓展性<br>
水平扩展增加服务器，垂直扩展增加服务器性能，增加磁盘、内存、CPU等，session是通过文件或者其他形式，比如数据库、redis等方式存在服务器中的。水平扩展时就需要专门创建一个专门的session存储系统，否则session没有办法共享，JWT是无状态的，无需专门处理。

* 安全性<br>
XSS攻击，都可以篡改Storage和JWT，所以JWT需要做签名和加密<br>
CSRF攻击，session和JWT会被窜改，增加CSRF保护措施<br>
重放攻击，可以设置session和JWT的有效时间<br>
中间人攻击，使用HTTPS可以防范

* RESTful API<br>
由于RESTful架构要求程序是无状态的，因此JWT非常契合

* 性能<br>
JWT性能不太好，客户端向服务端发送请求时，可能会有大量的用户信息在JWT中，会产生大量的请求开销，session的开销反而很小，但session在服务器端的开销反而大，每个请求都需要在服务端去查找session的信息，而JWT所需的信息则直接包含在JWT字符串中

* 时效性<br>
JWT时效性略差于session，JWT要等到过期时间才能销毁，session则可以在服务端手动或者主动销毁

---

## Node中的JWT

```js
npm i jsonwebtoken
// 通过签名生成token
token = jwt.sign({'name': 'wenbo'},'secret');
// 校验token
jwt.verify(token,'secret')
// { name: 'wenbo', iat: 1608542552 }
```

```js
async login(ctx) {
    ctx.verifyParams({
        name: { type: 'string', required: true },
        password: { type: 'string', required: true }
    })
    const user = await User.findOne(ctx.request.body);
    if (!user) { ctx.throw(401, '用户名或密码不正确') };
    const { _id, name } = user;
    // expiresIn 过去时间
    const token = jwt.sign({ _id, name }, secret, { expiresIn: '1d' });
    ctx.body = { token };
}
```

自定义授权登录中间件

```js
const auth = async (ctx, next) => {
    const { authorization = '' } = ctx.request.header;
    const token = authorization.replace('Bearer ', '');
    try {
        const user = jwt.verify(token, secret);
        ctx.state.user = user;
    } catch (error) {
        ctx.throw(401, error.message);
    }
    await next();
}
// 请求更新用户时，校验权限
router.patch('/:id', auth, update);
```

koa-jwt

```js
npm i koa-jwt --save

const jwt = require('koa-jwt');

const auth = jwt({ secret });
```
