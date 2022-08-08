# 数据模型的应用

## 个人信息schema设计

```js
const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const userSchema = new Schema({
    name: { type: String, required: true },
    password: { type: String, required: true, select: false },
    __v: { type: Number, select: false },
    avatar_url: { type: String },
    gender: { type: String, enum: ['male', 'female'], default: 'male', required: true },
    headline: { type: String },
    locations: { type: [{ type: String }] },
    business: { type: String },
    employments: {
        type: [
            {
                company: { type: String },
                job: { type: String }
            }
        ]
    },
    educations: {
        type: [
            {
                school: { type: String },
                major: { type: String },
                diploma: { type: Number, enum: [1, 2, 3, 4, 5] },
                entrance_year: { type: Number },
                graduation_year: { type: Number }
            }
        ]
    }
})

module.exports = model('User', userSchema);
```

更新接口校验

```js
ctx.verifyParams({
    name: { type: 'string', required: false },
    password: { type: 'string', required: false },
    avatar_url: { type: 'string', required: false },
    gender: { type: 'string', required: false },
    headline: { type: 'string', required: false },
    locations: { type: 'array', itemType: 'string', required: false },
    business: { type: 'string', required: false },
    employments: { type: 'array', itemType: 'object', required: false },
    educations: { type: 'array', itemType: 'object', required: false }
})
```

某些场景下我们并不想用户直接获取所有字段，只有在特定条件下才能获取相关数据，比如单纯地获取用户列表，并不想给用户展示locations、business、employments、educations等字段

```js
// 通过 select: false 字段限制用户获取相关字段

const userSchema = new Schema({
    name: { type: String, required: true },
    password: { type: String, required: true, select: false },
    __v: { type: Number, select: false },
    avatar_url: { type: String },
    gender: { type: String, enum: ['male', 'female'], default: 'male', required: true },
    headline: { type: String },
    locations: { type: [{ type: String }], select: false },
    business: { type: String, select: false },
    employments: {
        type: [
            {
                company: { type: String },
                job: { type: String }
            }
        ],
        select: false
    },
    educations: {
        type: [
            {
                school: { type: String },
                major: { type: String },
                diploma: { type: Number, enum: [1, 2, 3, 4, 5] },
                entrance_year: { type: Number },
                graduation_year: { type: Number }
            }
        ],
        select: false
    }
})
```

而当用户请求特定用户时，选择性的根据条件获取相关的数据，根据RESTful API的最佳实践，大部API都是通过 fields 来显示有哪些字段需要筛选

```js
// 请求接口
url = "localhost:3001/users/5fe07046b4adbc0996c970c1?fields=locations;business;employments"

async findById(ctx) {
    const { fields = '' } = ctx.query;
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
    const user = await User.findById(ctx.params.id).select(selectFields);
    if (!user) {
        ctx.throw(404, '用户不存在')
    }
    ctx.body = {
        user
    }
}
```

---

## 关注和粉丝模块的多对多关系设计

```js
// schema 新增 following 字段，通过 Schema.Types.ObjectId 声明模型的特定实例，对象的唯一 ID（_id）
// “ref” 告知模式分配哪个模型给该字段。
// 可以使用 populate() 方法在需要时提取 User 模型的相关信息。
const userSchema = new Schema({
    ...,
    following: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        select: false
    }
})

module.exports = model('User', userSchema);

async listFollowing(ctx) {
    const user = await User.findById(ctx.params.id).select('+following').populate('following');
    // 使用 populate() 方法获取到该 following 中 _id 用户的详细信息
    if (!user) { ctx.throw(404) };
    ctx.body = user.following;
}
async follow(ctx) {
    const id = ctx.params.id;
    const me = await User.findById(ctx.state.user._id).select('+following');
    if (!me.following.map(id => id.toString()).includes(id)) {
        me.following.push(id);
        me.save();
    }
    ctx.status = 204
}

async unfollow(ctx) {
    const id = ctx.params.id;
    const me = await User.findById(ctx.state.user._id).select('+following');

    me.following.map((id, index) => {
        if (id.toString() === id) {
            me.following.splice(index, 1);
            me.save();
        }
    })

    ctx.status = 204
}

async listFollowers(ctx) {
    const user = await User.find({ following: ctx.params.id });
    ctx.body = user;
}
```

---

## 话题Schema设计

```js
const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const topicSchema = new Schema({
    __v: { type: Number, select: false },
    name: { type: String, required: true },
    avatar_url: { type: String },
    introduction: { type: String, select: false }
})

module.exports = model('Topic', topicSchema);


class TopicsCtl {
    async find(ctx) {
        const { page = 1, per_page = 10 } = ctx.query;
        const pageSize = Math.max(page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);
        // 分页功能
        // 通过正则 new RegExp() 进行模糊匹配
        ctx.body = await Topic.find({ name: new RegExp(q) }).limit(perPage).skip(pageSize * perPage);
    }
    async findById(ctx) {
        ...
    }

    async create(ctx) {
        ...
    }

    async update(ctx) {
        ...
    }
}
```

---

## 用户属性用话题属性替代

修改User Schema <br>
通过 Schema.Types.ObjectId 和 ref 关联用户表和话题表

```js
const userSchema = new Schema({
    name: { type: String, required: true },
    password: { type: String, required: true, select: false },
    __v: { type: Number, select: false },
    avatar_url: { type: String },
    gender: { type: String, enum: ['male', 'female'], default: 'male', required: true },
    headline: { type: String },
    locations: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Topic'
            }
        ],
        select: false
    },
    business: { type: Schema.Types.ObjectId, ref: 'Topic', select: false },
    employments: {
        type: [
            {
                company: { type: Schema.Types.ObjectId, ref: 'Topic' },
                job: { type: Schema.Types.ObjectId, ref: 'Topic' }
            }
        ],
        select: false
    },
    educations: {
        type: [
            {
                school: { type: Schema.Types.ObjectId, ref: 'Topic' },
                major: { type: Schema.Types.ObjectId, ref: 'Topic' },
                diploma: { type: Number, enum: [1, 2, 3, 4, 5] },
                entrance_year: { type: Number },
                graduation_year: { type: Number }
            }
        ],
        select: false
    },
    following: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        select: false
    }
})
```

通过用户修改接口，修改用户属性为相对应的话题属性ObjectId

```js
{
   "avatar_url": "http://localhost:3001/uploads/upload_7429e56a3568789a3282562d291f4bd9.jpg",
   "gender": "male",
   "headline": "蜜汁小汉堡",
   "locations": ["5fe998860a99092e5a0bec2a","5fe9988a0a99092e5a0bec2b"],
   "business": "5fe998540a99092e5a0bec25",
   "employments": [
       {
           "company": "5fe998600a99092e5a0bec26",
           "job": "5fe997ef0a99092e5a0bec24"
       }
   ],
   "educations": [
       {
           "school": "5fe9987a0a99092e5a0bec29",
           "major": "5fe998750a99092e5a0bec28",
           "diploma": 4,
           "entrance_year": 2001,
           "graduation_year": 2004
       }
   ]
}
```

修改查询特定用户接口

```js
async findById(ctx) {
    const { fields = '' } = ctx.query;
    // select 字段过滤
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
    // populate 字段过滤
    const populateStr = fields.split(';').filter(f => f).map(f => {
        if (f === 'employments') {
            return 'employments.company employments.job'
        }
        if (f === 'educations') {
            return 'educations.school educations.major'
        }
        return f
    }).join(' ');
    const user = await User.findById(ctx.params.id).select(selectFields).populate(populateStr);

    if (!user) {
        ctx.throw(404, '用户不存在')
    }
    ctx.body = {
        user
    }
}
```

特定接口返回结果

```js
axios.post('localhost:3001/users/5fe07046b4adbc0996c970c1?fields=locations;business;employments').then(res => {
    console.log(res)
})

{
    "user": {
        "gender": "male",
        "locations": [
            {
                "_id": "5fe998860a99092e5a0bec2a",
                "name": "东北"
            },
            {
                "_id": "5fe9988a0a99092e5a0bec2b",
                "name": "陕西"
            }
        ],
        "_id": "5fe07046b4adbc0996c970c1",
        "name": "老八",
        "avatar_url": "http://localhost:3001/uploads/upload_7429e56a3568789a3282562d291f4bd9.jpg",
        "business": {
            "_id": "5fe998540a99092e5a0bec25",
            "name": "美食业"
        },
        "employments": [
            {
                "_id": "5fe99c4974ab0f31566a6e03",
                "company": {
                    "_id": "5fe998600a99092e5a0bec26",
                    "name": "阿里巴巴"
                },
                "job": {
                    "_id": "5fe997ef0a99092e5a0bec24",
                    "name": "美食家"
                }
            }
        ],
        "headline": "蜜汁小汉堡"
    }
}
```
