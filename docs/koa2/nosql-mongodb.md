# NoSQL和MongoDB

## NoSQL简介

::: tip
对不同于传统的关系型数据库的数据库管理系统的统称
:::

### NoSQL数据库分类

* 列存储（HBase）
* 文档存储（MongoDB）
* Key-value存储（Redis）
* 图存储（FlockDB）
* 对象存储（db4o）
* XML存储（BaseX）

### NoSQL的好处

* 简单（没有原子性、一致性、隔离性等复杂规范）
* 便于横向扩展
* 适合超大规模数据存储
* 很灵活存储复杂结构的数据（Schema Free）

---

## MongoDB

* 面向文档存储的开源数据库
* 由C++编写而成
* 性能好（内存计算）
* 支持大规模数据存储（可扩展性很强）
* 可靠、安全（本地复制，自动故障转移）
* 方便存储复杂数据结构
* 存储的数据形式类似于一个个JavaScript对象

---

## MongoDB Atlas

* MongoDB Atlas官网[](https://cloud.mongodb.com/)

## mongoose的使用

* mongoose连接

```js
// index.js
npm install mongoose --save

const mongoose = require('mongoose');

mongoose.connect('数据库地址', { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('mongodb 连接成功'));
mongoose.connection.on('error', console.error);

```

* 创建相关Schema

```js
// models/users.js
const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const userSchema = new Schema({
    name: { type: String, required: true }
})

module.exports = model('User', userSchema);
```

* 用户的增删改查

```js
const User = require('../models/users');

class UsersCtl {
    async find(ctx) {
        ctx.body = await User.find();
    }
}

module.exports = new UsersCtl()

    async findById(ctx) {
        const user = await User.findById(ctx.params.id);
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = {
            user
        }
    }

    async create(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true }
        })
        const user = await User(ctx.request.body).save();
        ctx.body = user;
    }

    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true }
        })
        await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        const user = await User.findById(ctx.params.id);
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        console.log(user);
        ctx.body = user;
    }

    async delete(ctx) {
        const user = await User.findByIdAndRemove(ctx.params.id);
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.status = 204;
    }
}
```
