const fs = require('fs')
const config = {}
const path = require('path')

config.baseUrl = `http://localhost:3000`

const me = JSON.parse(fs.readFileSync(path.resolve(__dirname, './me.json')))
config.me = me
config.uid = 371566175
config.pid = 903865698

const proxyList =
    [
        'http://116.199.2.196:80',
        'http://116.199.2.197:80',
        'http://116.199.2.208:80',
        'http://116.199.2.209:80',
        'http://116.199.2.210:80',
        'http://116.199.115.78:80',
        'http://116.199.115.79:80',
    ]
config.proxyList = proxyList
config.proxy = proxyList[0]
// config.proxy = 'http://localhost:8888'

// console.log(me)

module.exports = config