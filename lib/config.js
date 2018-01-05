const fs = require('fs')

const me = JSON.parse(fs.readFileSync('./me.json'))

const config = {}
config.me = me
config.uid = me.profile.userId
config.proxy = 'http://116.199.115.78:81'

// console.log(me)

module.exports = config