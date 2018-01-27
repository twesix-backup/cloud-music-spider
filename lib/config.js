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
        'http://cs.twesix.cn:65535',
        'http://47.95.156.128:65535',
        'http://47.93.90.48:65535',
        'http://47.95.156.103:65535',
        'http://47.95.157.24:65535',
        'http://47.95.157.129:65535',
        'http://47.95.157.26:65535',
        'http://59.110.6.252:65535',
        'http://59.110.13.164:65535',
        'http://47.95.157.107:65535',
        'http://59.110.6.244:65535',
    ]
config.proxyList = proxyList
config.proxy = proxyList[0]
// config.proxy = 'http://localhost:8888'

// console.log(me)

module.exports = config