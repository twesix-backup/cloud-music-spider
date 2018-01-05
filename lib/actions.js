const baseUrl = `http://localhost:3000`
const get = require('./utils').get
const config = require('./config')
const querystring = require('querystring')
const proxy =
    [
        'http://116.199.2.196:80',
        'http://116.199.2.196:82',
        'http://116.199.2.208:80',
        'http://116.199.2.208:82',
        'http://116.199.2.209:80',
        'http://116.199.2.209:82',
        'http://116.199.2.210:80',
        'http://116.199.2.210:82',
        'http://116.199.115.78:80',
        'http://116.199.115.78:81',
        'http://116.199.115.78:82',
        'http://116.199.115.79:80',
        'http://116.199.115.79:82',
    ]

const action = async function(path, query, proxy = false)
{
    let url = `${baseUrl}${path}?${querystring.stringify(query)}`
    if (proxy)
    {
        url = url + `&proxy=${proxy}`
    }
    return get(url)
}

module.exports.userFolloweds = async function(uid, proxy = false)
{
    return action('/user/followeds', { uid: uid }, proxy)
}

module.exports.userFollows = async function(uid, proxy = false)
{
    return action('/user/follows', { uid: uid }, proxy)
}

module.exports.userPlaylist = async function(uid, proxy = false)
{
    return action('/user/playlist', { uid: uid }, proxy)
}

module.exports.userDetail = function(uid, proxy = false)
{
    return action('/user/detail', { uid: uid }, proxy)
};

(async function()
{
    // console.log(await module.exports.userFolloweds(config.uid, config.proxy))
    // console.log(await module.exports.userFollows(config.uid, config.proxy))
    // console.log(await module.exports.userPlaylist(config.uid, config.proxy))
    // console.log(await module.exports.userDetail(config.uid, config.proxy))
})()