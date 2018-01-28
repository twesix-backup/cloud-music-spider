const fs = require('fs')
const config = {}
const path = require('path')

config.baseUrl = `http://localhost:3000`

const me = JSON.parse(fs.readFileSync(path.resolve(__dirname, './me.json')))
config.me = me
config.uid = 371566175
config.pid = 903865698
config.mid = 33894312

const proxyList =
    [
        // 'http://116.199.2.196:80',
        // 'http://116.199.2.197:80',
        // 'http://116.199.2.208:80',
        // 'http://116.199.2.209:80',
        // 'http://116.199.2.210:80',
        'http://116.199.115.78:80',
        'http://116.199.115.79:80',
        // 'http://cs.twesix.cn:65535',
        'http://47.95.158.94:65535',
        'http://59.110.9.202:65535',
        'http://47.95.22.163:65535',
        'http://59.110.12.151:65535',
        'http://59.110.13.200:65535',
        'http://47.95.158.103:65535',
        'http://47.95.157.160:65535',
        'http://59.110.15.177:65535',
        'http://59.110.15.146:65535',
        'http://59.110.14.25:65535',
    ]
config.proxyList = proxyList
config.proxy = proxyList[0]
// config.proxy = 'http://localhost:8888'

// console.log(me)

module.exports = config