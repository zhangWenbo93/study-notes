const router1 = require('../node-koa/router.js')
const router2 = require('../design-patterns/router.js')
const router3 = require('../interview-basis/router.js')
const router4 = require('../interview-advanced/router.js')
const router5 = require('../cms-vue/router.js')

module.exports = {
    title: '笔记',
    description: '自我学习',
    port: '8888',
    markdown: {
        lineNumbers: false // 代码块显示行号
    },
    themeConfig: {
        activeHeaderLinks: false,
        smoothScroll: true,
        lastUpdated: '最后更新时间',
        nav: [
            {
                text: '笔记',
                items: [
                    { text: 'Node-Koa', link: '/node-koa/restful' },
                    { text: '设计模式', link: '/design-patterns/面向对象_01' },
                    { text: '面试基础', link: '/interview-basis/mind-mapping' },
                    { text: '面试进阶', link: '/interview-advanced/mind-mapping' },
                    { text: 'vue读书后台管理', link: '/cms-vue/advance' }
                ]
            }
        ],
        sidebar: {
            '/node-koa/': [
                {
                    title: 'Node-Koa',
                    collapsable: false,
                    children: router1
                }
            ],
            '/design-patterns/': [
                {
                    title: '设计模式',
                    collapsable: false,
                    sidebarDepth: 2,
                    children: router2
                }
            ],
            '/interview-basis/': [
                {
                    title: '面试基础',
                    collapsable: false,
                    sidebarDepth: 2,
                    children: router3
                }
            ],
            '/interview-advanced/': [
                {
                    title: '面试进阶',
                    collapsable: false,
                    sidebarDepth: 2,
                    children: router4
                }
            ],
            '/cms-vue/': [
                {
                    title: 'vue读书后台管理',
                    collapsable: false,
                    sidebarDepth: 2,
                    children: router5
                }
            ]
        }
    }
}
