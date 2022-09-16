const router1 = require('../koa2/router.js')
const router2 = require('../design-patterns/router.js')
const router3 = require('../interview-basis/router.js')
const router4 = require('../interview-advanced/router.js')
const router5 = require('../cms-vue/router.js')
const router6 = require('../HTTP/router.js')
const router7 = require('../node/router.js')

module.exports = {
    title: 'Notes',
    description: '自我学习',
    base: '/study-notes/',
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
                    { text: 'koa2', link: '/koa2/restful' },
                    { text: '设计模式', link: '/design-patterns/面向对象_01' },
                    // { text: '面试基础', link: '/interview-basis/mind-mapping' },
                    { text: '能力进阶', link: '/interview-advanced/mind-mapping' },
                    { text: 'vue koa 实现后台管理', link: '/cms-vue/advance' },
                    { text: 'HTTP协议', link: '/HTTP/了解HTTP协议' },
                    { text: 'node应用开发', link: '/node/Node.js在前后端的区别' }
                ]
            }
        ],
        sidebar: {
            '/koa2/': [
                {
                    title: 'koa2',
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
            // '/interview-basis/': [
            //     {
            //         title: '面试基础',
            //         collapsable: false,
            //         sidebarDepth: 2,
            //         children: router3
            //     }
            // ],
            '/interview-advanced/': [
                {
                    title: '能力进阶',
                    collapsable: false,
                    sidebarDepth: 2,
                    children: router4
                }
            ],
            '/cms-vue/': [
                {
                    title: 'vue koa 实现后台管理',
                    collapsable: false,
                    sidebarDepth: 2,
                    children: router5
                }
            ],
            '/HTTP/': [
                {
                    title: 'HTTP协议',
                    collapsable: false,
                    sidebarDepth: 4,
                    children: router6
                }
            ],
            '/node/': [
                {
                    title: 'node应用开发',
                    collapsable: false,
                    sidebarDepth: 4,
                    children: router7
                }
            ]
        }
    }
}
