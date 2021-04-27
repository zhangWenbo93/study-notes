# 复杂设计库的设计

## 嵌套数据模型

#### 评论与相关问题和答案的模型

```js
// 下面的评论 Schema 就是一个三级嵌套的复杂数据模型
// questionId 关联相对应的问题 id
// answerId 关联相对应的回答 id
// 通过三级路由嵌套 将评论和所对应的问题和答案对应起来

const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const commentSchema = new Schema({
    __v: { type: Number, select: false },
    content: { type: String, required: true },
    commentator: { type: Schema.Types.ObjectId, ref: 'User', required: true, select: false },
    // 用 questionId 表示从属于某一个问题
    questionId: { type: String, required: true },
    answerId: { type: String, required: true },
    rootCommentId: { type: String },
    replyTo: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

module.exports = model('Comment', commentSchema);

// 例如：
GET axios.get('localhost:3001/questions/5feae88fc9a2196eb54cdc66/answer/5fed44531832d12d63499bd2/comments?rootCommentId=5ff427d20bd8c70a5d5cf778');
```

#### 个人信息详细数据库设计

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
    },
    followingTopics: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Topic'
            }
        ],
        select: false
    },
    likeingAnswers: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Answer'
            }
        ],
        select: false
    },
    disLikeingAnswers: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Answer'
            }
        ],
        select: false
    },
    collectingAnswers: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Answer'
            }
        ],
        select: false
    }
}, { timestamps: true })

module.exports = model('User', userSchema);
```