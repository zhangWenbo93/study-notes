# Koa控制器

## 控制器简介

* 拿到路由分配的任务，并执行
* 在Koa中，控制器也是一个中间件
* 可以获取HTTP请求参数
* 可以处理业务逻辑，获取、计算、存储数据
* 根据不同的情况发送不用的HTTP响应

---

## 获取HTTP请求参数

* Query String，如?q=keyword
* Router Params， 如/users/:id
* Body，如{ name: "张三" }，（放在链接中不安全，后台日志会将某些蒙安数据暴露在日志当中，在一个，浏览器对于拼接参数有长度限制）
* Header，如：Accept,Cookie

#### 操作步骤

* 设置断点调试
* 获取query
* 获取router params
* 获取body
* 获取header

---

## 发送HTTP响应

* 发送status，如200、400等
* 发送Body，如{ name: "张三" }
* Header，如：Allow,Content-type

---

### 操作步骤

* 将路有单独放在一个目录
* 将控制器单独放在一个目录
* 使用类+类方法的方式组织控制器

---

### 编写控制器

* 每个资源都控制器放在不同的文件里
* 尽量使用类+类方法的形式编写控制器
* 需要有严谨的错误处理
