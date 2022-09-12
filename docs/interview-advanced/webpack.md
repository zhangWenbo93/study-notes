# Webpack

## 基本配置

### 拆分配置和 merge

初步构建项目，webpack 文件划分如下：

* paths.js：常用的文件路径
* webpack.common.js：公共的webpack配置
* webpack.dev.js：本地开发配置
* webpack.prod.js：线上环境配置

```html
build-base-config
├─paths.js
├─webpack.common.js
├─webpack.dev.js
└-webpack.prod.js
```

**merge 如下**，通过 webpack-merge 将 webpack.common.js 和 dev.js 或 prod.js做合并

```js
const path = require('path')
const webpack = require('webpack')
const webpackCommonConf = require('./webpack.common')
const { smart } = require('webpack-merge')
const { srcPath, disPath } = require('./paths')

module.exports = smart(webpackCommonConf, {
    ...
})
```

### 启动本地服务

安装 webpack-dev-server。

```sh
npm install webpack-dev-server --save-dev
```

在 webpack.dev.js 下配置

```js
module.exports = smart(webpackCommonConf,{
    ...,
    devServer: {
        prot: 8999,
        progress: true, // 显示打包的进度条
        contentBase: disPath, // 根目录
        open: true, // 自动打开浏览器
        compress: true, // 启动 gzip 压缩

        proxy: {
            // 将 api/xxx 代理到 localhost:3000/api/xxx
            'api': 'http://localhost:3000',
            // 将 api2/xxx 代理到 localhost:3000/xxx
            'api2': {
                target: 'http://localhost:3000',
                pathRewrite: {
                    'api2': ''
                }
            }
        }
    }
})
```

### 处理 ES6

安装 webpack-dev-server。

```sh
npm install babel-loader --save-dev
```

在 webpack.common.js 下配置

```js
module.exports = {
    entry: path.join(srcPath, 'index'),
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: ['babel-loader'],
                include: srcPath,
                exclude: /node_modules/
            }
        ]
    }
}
```

在根目录下创建 .babelrc

```json
{
    "presets": [
        "@babel/preset-env"
    ],
    "plugins": []
}
```

### 处理样式

安装 webpack-dev-server。

```sh
npm install style-loader css-loader postcss-loader less-loader --save-dev
```

通过 css-loader/ess-loader 解析 css 文件，然后通过 style-loader 插入到页面中。

在 webpack.common.js 下配置

```js
module.exports = {
    entry: path.join(srcPath, 'index'),
    module: {
        rules: [
            {
                test: /\.css$/,
                // loader 的执行顺序是从后往前
                loader: ['style-loader', 'css-loader', 'postcss-loader']
            },
            {
                test: /\.less$/,
                loader: ['style-loader', 'css-loader', 'less-loader']
            }
        ]
    }
}
```

postcss-loader autoprefixer 处理样式文件的中的浏览器兼容性，在根目录新建文件 postcss.config.js。

```js
module.exports = {
    plugins: [require('autoprefixer')]
}
```

### 处理图片

#### development 模式下

```js
module.exports = smart(webpackCommonConf, {
    mode: 'development'
    output: {
        filename: 'bundle.[contentHash:8].js',
        path: disPath
    },
    module: {
        rules: [
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                loader: 'file-loader'
            }
        ]
    }
})
```

#### production 模式下

```js
module.exports = smart(webpackCommonConf, {
    mode: 'development'
    module: {
        rules: [
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        // 小于5kb的用base64格式产出，目的是小于5kb的图片以base64的方式加载，减少http的网络请求
                        limit: 5 * 1024,
                        // 打包到img1 目录下
                        outputPath: '/img1/'
                    }
                }
            }
        ]
    }
})
```

### 模块化

## 高级配置

### 多入口文件

项目需求中需要配置多入口，即存在 index.html 入口，也存在 other.html 入口，通过 webpack 配置如下：

#### webpack.common.js#1 注意几点

* entry 配置多文件入口
* 配置多个 new HtmlWebpackPlugin 对应入口文件个数
* chunks 表示该页面要引入哪些 chunk，即上面 index 和 other 对应的 js

```js
module.exports = {
    entry: {
        index: path.join(srcPath, 'index'),
        other: path.join(srcPath, 'other')
    },
    ...
    plugins: [
        ...
        new HtmlWebpackPlugin({
            template: path.join(srcPath, 'index.html'),
            filename: 'index.html',
            chunks: ['index'] // 只引入 index.js
        }),
        new HtmlWebpackPlugin({
            template: path.join(srcPath, 'index.html'),
            filename: 'other.html',
            chunks: ['other'] // 只引入 other.js
        })
        ...
    ]
}
```

#### webpack.prod.js#1 注意几点

* output 输出时的 filename 配置，[name] 即是多入口时 entry 的 key
* new CleanWebpackPlugin 每次生成都需要清空之前的文件夹

```js
module.exports = smart(webpackCommonConf, {
    mode: 'production'
    output: {
        filename: '[name].[contentHash:8].js',
        path: disPath
    },
    ...
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            PRO: JSON.stringify('production')
        })
    ]
})
```

### 压缩 CSS

* 将不再 webpack.common.js 下做 css 处理
* webpack.dev.js 和 webpack.prod.js 做不同的 css 处理

#### webpack.dev.js#1

```js
module.exports = smart(webpackCommonConf, {
    mode: 'development'
    module: {
        rules: [
            {
                test: /\.css$/,
                // loader 的执行顺序是：从后往前
                loader: ['style-loader', 'css-loader', 'postcss-loader'] // 加了 postcss
            },
            {
                test: /\.less$/,
                // 增加 'less-loader' ，注意顺序
                loader: ['style-loader', 'css-loader', 'less-loader']
            }
        ]
    }
})
```

#### webpack.prod.js#2

* 引入 mini-css-extract-plugin 以及 optimize-css-assets-webpack-plugin、terser-webpack-plugin
* 用 MiniCssExtractPlugin.loader 替代 style-loader
* 用 new MiniCssExtractPlugin 抽离 css 文件
* 用 new TerserJSPlugin、new OptimizeCSSAssetsPlugin 压缩 css

```ssh
npm install mini-css-extract-plugin optimize-css-assets-webpack-plugin terser-webpack-plugin --save-dev
```

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = smart(webpackCommonConf, {
    mode: 'production'
    module: {
        rules: [
            // 抽离 css
            {
                test: /\.css$/,
                loader: [
                    MiniCssExtractPlugin.loader,  // 注意，这里不再用 style-loader
                    'css-loader',
                    'postcss-loader'
                ]
            },
            // 抽离 less --> css
            {
                test: /\.less$/,
                loader: [
                    MiniCssExtractPlugin.loader,  // 注意，这里不再用 style-loader
                    'css-loader',
                    'less-loader',
                    'postcss-loader'
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(), // 会默认清空 output.path 文件夹
        new webpack.DefinePlugin({
            // window.ENV = 'production'
            ENV: JSON.stringify('production')
        }),

        // 抽离 css 文件
        new MiniCssExtractPlugin({
            filename: 'css/main.[contentHash:8].css'
        })
    ],

    optimization: {
        // 压缩 css
        minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    }
})
```

### 抽离公共代码

本地开发时，处理 js 和 css 一致，不做切割打包处理，为了研发调试速度更快，一般只做线上处理。

#### webpack.prod.js#3

* 通过 splitChunks 配置分隔代码块
* chunks 正常情况下选择 all 模式
* 对三方模块和公共模块分别作分割处理

```js
module.exports = smart(webpackCommonConf, {
    mode: 'production'
    module: {
        rules: [
            // 抽离 css
            ...
        ]
    },
    plugins: [
        ...
    ],

    optimization: {
        // 压缩 css
        minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
        // 分割代码块
        splitChunks: {
            chunks: 'all',
            /**
             * initial 入口 chunk，对于异步导入的文件不处理
               async 异步 chunk，只对异步导入的文件处理
               all 全部 chunk
             */

            // 缓存分组
            cacheGroups: {
                // 第三方模块
                vendor: {
                    name: 'vendor', // chunk 名称
                    priority: 1, // 权限更高，优先抽离，重要！！！
                    test: /node_modules/,
                    minSize: 0,  // 大小限制
                    minChunks: 1  // 最少复用过几次
                },

                // 公共的模块
                common: {
                    name: 'common', // chunk 名称
                    priority: 0, // 优先级
                    minSize: 0,  // 公共模块的大小限制
                    minChunks: 2  // 公共模块最少复用过几次
                }
            }
        }
    }
})
```

#### webpack.common.js#3

根据源文件自身引入的 js 模块，chunks 配置不同的拆分模块，比如 index 除了自身 js 外还引入了三方库和公共模块，则配置如下。
而 other 出去自身 js 外只引入了公共模块，则配置如下。

chunk 的生成除了 entry 之外，还有就是 splitChunks 也可以生成 chunk。而 new HtmlWebpackPlugin() 里面的 chunks 只是对生成 chunk 的引用。

:::tip
module chunk bundle 的区别
:::

* module 各个源码文件，webpack 中一切皆模块
* chunk 多模块合并而成，如 entry，import，splitChunks
* bundle 最终输出的文件

```js
module.exports = {
    entry: {
        index: path.join(srcPath, 'index'),
        other: path.join(srcPath, 'other')
    },
    ...
    plugins: [
        ...
        // 多入口 - 生成 index.html
        new HtmlWebpackPlugin({
            template: path.join(srcPath, 'index.html'),
            filename: 'index.html',
            // chunks 表示该页面要引用哪些 chunk （即上面的 index 和 other），默认全部引用
            chunks: ['index', 'vendor', 'common']  // 要考虑代码分割
        }),
        // 多入口 - 生成 other.html
        new HtmlWebpackPlugin({
            template: path.join(srcPath, 'other.html'),
            filename: 'other.html',
            chunks: ['other', 'common']  // 考虑代码分割
        })
    ]
}
```

### 懒加载

引入动态出具--懒加载，此处也会产生一个 chunk。

```js
setTimeout(() => {
    import('./js/dynamic-data.js').then((res) => {
        console.log(res.default.xxx)
    })
}, 2000)
```

## 优化打包构建效率

### 优化 babel-loader

```js
    {
        test: /\.js$/,
        loader: ['babel-loader?cacheDirectory'], // 开启缓存
        include: path.resolve(__dirname, 'src'), // 明确范围
        // include 和 exclude 二选其一
        // exclude: path.resolve(__dirname, 'node_modules')
    }
```

### happyPack 多进程打包

因为 JS 是单线程，开启多进程打包可以提高构建速度（多核 CPU），happyPack 就是开启这个多进程打包。

happyPack 可以再 common 也可以放在 prod，同时供本地和线上环境使用多进程打包。

```js
const HappyPack = require('happypack')

module.exports = smart(webpackCommonConf, {
    mode: 'production'
    module: {
        rules: [
            // 替换原有的 babel-loader
            {
                test: /\.js$/,
                // 把对 .js 文件的处理转交给 id 为 babel 的 HappyPack 实例
                use: ['happypack/loader?id=babel'],
                include: srcPath,
                // exclude: /node_modules/
            },
            ...
        ]
    },
    plugins: [
        ...
        // happyPack 开启多进程打包
        new HappyPack({
            // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件
            id: 'babel',
            // 如何处理 .js 文件，用法和 Loader 配置中一样
            loaders: ['babel-loader?cacheDirectory']
        }),
        ...
    ]
})
```

### ParallelUglifyPlugin 多进程压缩JS

ParallelUglifyPlugin 放在 prod即可，供线上环境使用多进程压缩 JS。

```js
const HappyPack = require('happypack')

module.exports = smart(webpackCommonConf, {
    mode: 'production'
    module: {
        rules: [
            // 替换原有的 babel-loader
            {
                test: /\.js$/,
                // 把对 .js 文件的处理转交给 id 为 babel 的 HappyPack 实例
                use: ['happypack/loader?id=babel'],
                include: srcPath,
                // exclude: /node_modules/
            },
            ...
        ]
    },
    plugins: [
        ...
        // 使用 ParallelUglifyPlugin 并行压缩输出的 JS 代码
        new ParallelUglifyPlugin({
            // 传递给 UglifyJS 的参数
            // （还是使用 UglifyJS 压缩，只不过帮助开启了多进程）
            uglifyJS: {
                output: {
                    beautify: false, // 最紧凑的输出
                    comments: false, // 删除所有的注释
                },
                compress: {
                    // 删除所有的 `console` 语句，可以兼容ie浏览器
                    drop_console: true,
                    // 内嵌定义了但是只用到一次的变量
                    collapse_vars: true,
                    // 提取出出现多次但是没有定义成变量去引用的静态值
                    reduce_vars: true,
                }
            }
        })
        ...
    ]
})
```

happyPack 和 ParallelUglifyPlugin 适用于项目较大，打包缓慢，开启后可提升打包效率，但如果项目小，打包流畅，反而会因为进程开销的缘故导致打包速率降低。所以要根据项目按需使用。

### 热更新

* 自动刷新：整个网页全部刷新，速度变慢，状态丢失
* 热更新：新代码生效，整个网页不刷新，状态不丢失

热更新只在开发环境下生效，因次只要配置 webpack.dev.js 即可。

```js
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin');

module.exports = smart(webpackCommonConf, {
    mode: 'development',
    entry: {
        // index: path.join(srcPath, 'index.js'),
        index: [
            // http://localhost:8080/ 本地项目的地址
            'webpack-dev-server/client?http://localhost:8080/',
            'webpack/hot/dev-server',
            path.join(srcPath, 'index.js')
        ],
        other: path.join(srcPath, 'other.js')
    },
    plugins: [
        new webpack.DefinePlugin({
            // window.ENV = 'production'
            ENV: JSON.stringify('development')
        }),
        new HotModuleReplacementPlugin()
    ],

    devServer: {
        ...
        hot: true,
        ...
    }
})
```

需要在开发环境下自行配置需要热更新的模块，代码如下：

```js
if(module.hot) {
    module.hot.accept(['./需要热更新的模块.js'], () => {
        // 需要热更新的模块的执行函数
    })
}
```

如果不这么处理，那么还是自动刷新的操作。

### DullPlugin 动态链接库插件

需要在开发环境下自行配置 dll 文件，我们以 vue 项目为例，新建 webpack.dll.js，代码如下：

```js
const path = require('path')
const DllPlugin = require('webpack/lib/DllPlugin')
const { srcPath, distPath } = require('./paths')

module.exports = {
  mode: 'development',
  // JS 执行入口文件
  entry: {
    // 把 Vue 相关模块的放到一个单独的动态链接库
    vue: ['vue', 'vue-router', 'vuex']
  },
  output: {
    // 输出的动态链接库的文件名称，[name] 代表当前动态链接库的名称，
    // 也就是 entry 中配置的 vue 和 polyfill
    filename: '[name].dll.js',
    // 输出的文件都放到 dist 目录下
    path: distPath,
    // 存放动态链接库的全局变量名称，例如对应 vue 来说就是 _dll_vue
    // 之所以在前面加上 _dll_ 是为了防止全局变量冲突
    library: '_dll_[name]',
  },
  plugins: [
    // 接入 DllPlugin
    new DllPlugin({
      // 动态链接库的全局变量名称，需要和 output.library 中保持一致
      // 该字段的值也就是输出的 manifest.json 文件 中 name 字段的值
      // 例如 vue.manifest.json 中就有 "name": "_dll_vue"
      name: '_dll_[name]',
      // 描述动态链接库的 manifest.json 文件输出时的文件名称
      path: path.join(distPath, '[name].manifest.json'),
    }),
  ]
}
```

在 package.json 中新增脚本

```ssh
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "devBuild": "webpack --config build/webpack.dev.js",
    "dev": "webpack-dev-server --config build/webpack.dev.js",
    "dll": "webpack --config build/webpack.dll.js"
  }
```

执行完 `npm run dll` 之后，要在对应的项目 index.html 中引用，如下：

```html
<script src="./vue.dll.js"></script>
```

然后再 webpack.dev.js 中配置， 告诉 Webpack 使用了哪些动态链接库

```js
// 第一，引入 DllReferencePlugin
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');

module.exports = smart(webpackCommonConf, {
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: ['babel-loader'],
                include: srcPath,
                exclude: /node_modules/ // 第二，不要再转换 node_modules 的代码
            },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            // window.ENV = 'production'
            ENV: JSON.stringify('development')
        }),
        // 第三，告诉 Webpack 使用了哪些动态链接库
        new DllReferencePlugin({
            // 描述 vue 动态链接库的文件内容
            manifest: require(path.join(distPath, 'vue.manifest.json')),
        }),
    ],
    ...
})
```

### 环境对比

可用于线上环境：

* 优化babel-loader
* IgnorePlugin
* noParse
* happyPack
* ParallelUglifyPlugin

不可用于生产环境

* 自动刷新
* 热更新
* DllPlugin

## 优化产出代码

## 构建流程概述

## babel
