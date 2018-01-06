const fs = require('fs')
const config = {}

const me = JSON.parse(fs.readFileSync('./me.json'))
config.me = me
config.uid = me.profile.userId

const proxy =
    [
        'http://116.199.2.196:80',
        'http://116.199.2.197:80',
        'http://116.199.2.208:80',
        'http://116.199.2.209:80',
        'http://116.199.2.210:80',
        'http://116.199.115.78:80',
        'http://116.199.115.79:80',
    ]
config.proxy = proxy[0]
// config.proxy = 'http://localhost:8888'

// console.log(me)

module.exports = config