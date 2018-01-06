const baseUrl = `http://localhost:3000`
const get = require('./utils').get
const config = require('./config')
const mongodb = require('./db/mongodb')
const querystring = require('querystring')

const action = async function(path, query, proxy = false)
{
    let url = `${baseUrl}${path}?${querystring.stringify(query)}`
    if (proxy)
    {
        url = url + `&proxy=${proxy}`
    }
    console.log(url)
    return get(url)
}

// 关注我的人
module.exports.userFolloweds = async function(uid, proxy = false)
{
    try
    {
        const result = JSON.parse(await action('/user/followeds', { uid: uid }, proxy))
        const followeds = result.followeds
        let failure = 0
        while (followeds.length > 0)
        {
            const item = followeds.pop()
            const ok = await mongodb.insertFollow
            (
                {
                    from: item.userId,
                    to: uid
                }
            )
            if (! ok)
            {
                failure ++
                followeds.unshift(item)
                if(failure > 10)
                {
                    return false
                }
            }
        }
        return true
    }
    catch (e)
    {
        console.log(e)
        return false
    }
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
    console.log(await module.exports.userFolloweds(config.uid, config.proxy))
    // console.log(await module.exports.userFollows(config.uid, config.proxy))
    // console.log(await module.exports.userPlaylist(config.uid, config.proxy))
    // console.log(await module.exports.userDetail(config.uid, config.proxy))
})()