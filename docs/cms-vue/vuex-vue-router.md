# Vuex 和 Vue-router 进阶

## Vuex 原理解析

::: tip
[查看](https://github.com/answershuto/learnVue/tree/master/vuex-src) vuex 源码解析
:::

```html
<html>
  <head>
    <title>vuex 原理解析</title>
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
  </head>
  <body>
    <div id="root">{{data}}</div>
    <div id="root2">{{data2}}</div>
    <div id="root3">
      <button @click="change">change</button>
    </div>
    <script>
      function registerPlugin(Vue) {
        // 模拟 vuex
        const vuex = {}
        vuex._vm = new Vue({
          data: {
            message: 'hello vue.js'
          }
        })
        vuex.state = vuex._vm
        vuex.mutations = {
          setMessage(value) {
            vuex.state.message = value
          }
        }
        function init() {
          this.$store = vuex
        }
        Vue.mixin({
          // 全局在 beforeCreate 阶段挂载 $store => vuex
          beforeCreate: init
        })
      }
      Vue.use(registerPlugin)
      new Vue({
        el: '#root',
        computed: {
          data() {
            return this.$store.state.message
          }
        }
      })
      new Vue({
        el: '#root2',
        computed: {
          data2() {
            return this.$store.state.message
          }
        }
      })
      new Vue({
        el: '#root3',
        methods: {
          change() {
            const newValue = this.$store.state.message + '.'
            this.$store.mutations.setMessage(newValue)
          }
        }
      })
    </script>
  </body>
</html>
```

上述例子中是的 `message` 都会放入 `Vue` 中的 `Dep` 对象中，`Dep` 是一个全局的管理全局依赖的对象，当放入其中的 `message` 更新的时候， `Dep` 会通知所有的 `watcher` 进行更新，而 `watcher` 也在 `Dep` 中进行管理。一旦发生响应数据更新时，`Dep` 会下所有的 `watcher` 更新，所对应的 `Vue` 实类都会发生变化。

## vue-router 实现原理

:::tip
[查看](https://github.com/answershuto/learnVue/tree/master/vue-router-src) vue-router 源码分析
:::

vue-router 其实是对原生浏览器路由能力的一个封装，实际是通过  window.location 下提供的不同方法实现不同模式的路由。vue-router 实例化时会初始化 this.history，不同 mode 对应不同的 history，当默认不传 mode 的时候，默认生成的就是 hash 模式

```js
constructor (options: RouterOptions = {}) {
    this.mode = mode

    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base)
        break
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback)
        break
      case 'abstract':
        this.history = new AbstractHistory(this, options.base)
        break
      default:
        if (process.env.NODE_ENV !== 'production') {
          assert(false, `invalid mode: ${mode}`)
        }
    }
}
```

以 HashHistory 为例，vue-router 的 push 方法实现如下：

```js
push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    // $flow-disable-line
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise((resolve, reject) => {
        this.history.push(location, resolve, reject)
      })
    } else {
      this.history.push(location, onComplete, onAbort)
    }
}
```

HashHistory 具体实现了 push 方法：

```js
function pushHash (path) {
  if (supportsPushState) {
    pushState(getUrl(path))
  } else {
    window.location.hash = path
  }
}
```

对路由的监听通过 hash 相应的事件监听实现：

```js
window.addEventListener(
  supportsPushState ? 'popstate' : 'hashchange',
  () => {
    const current = this.current
    if (!ensureSlash()) {
      return
    }
    this.transitionTo(getHash(), route => {
      if (supportsScroll) {
        handleScroll(this.router, route, current, true)
      }
      if (!supportsPushState) {
        replaceHash(route.fullPath)
      }
    })
  }
)
```

除此之外，vue-router 还提供了两个组件：

```js
Vue.component('RouterView', View)
Vue.component('RouterLink', Link)
```
