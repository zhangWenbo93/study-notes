# Koa 上传图片

```js
// 使用koa-body 替换koa-bodyparser
npm i koa-body --save

const koaBody = require('koa-body');

app.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, '/public/uploads'),
        keepExtensions: true // 保留拓展名
    }
}));

// 使用koa-static转化图片路径名
npm i koa-static --save

const KoaStatic = require('koa-static');

app.use(KoaStatic(path.join(__dirname, 'public')));

upload(ctx) {
    const file = ctx.request.files.file;
    const basename = path.basename(file.path);
    ctx.body = { url: `${ctx.origin}/uploads/${basename}` };
}
```
