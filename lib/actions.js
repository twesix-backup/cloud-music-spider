const baseUrl = `http://localhost:3000`
const get = require('./utils').get
const config = require('./config')
const mongodb = require('./db/mongodb')
const querystring = require('querystring')

const sleep = function(ms)
{
    return new Promise(function(resolve)
    {
        setTimeout(function()
        {
            resolve()
        }, ms)
    })
}

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

const queue = async function(array, action)
{
    try
    {
        let failure = 0
        while (array.length > 0)
        {
            const item = array.pop()
            const ok = await action(item)
            if (! ok)
            {
                failure ++
                array.unshift(item)
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

// 关注我的人
module.exports.userFolloweds = async function(uid, proxy = false)
{
    const result = JSON.parse(await action('/user/followeds', { uid: uid }, proxy))
    return await queue(result.followeds, async function(item)
    {
        return await mongodb.insertFollow
        (
            {
                from: item.userId,
                to: uid
            }
        ) && await mongodb.insertUserUnprocessed
        (
            {
                profile:
                    {
                        userId: item.userId
                    }
            }
        )
    })
}

module.exports.userFollows = async function(uid, proxy = false, offset = 0, limit = 100)
{
    const result = JSON.parse(await action('/user/follows', { uid: uid, offset: offset, limit: limit }, proxy))
    if(result.more)
    {
        const ok = await module.exports.userFollows(uid, proxy, offset + limit)
        if(! ok)
        {
            return false
        }
    }
    return await queue(result.follow, async function(item)
    {
        return await mongodb.insertFollow
        (
            {
                from: uid,
                to: item.userId
            }
        ) && await mongodb.insertUserUnprocessed
        (
            {
                profile:
                    {
                        userId: item.userId
                    }
            }
        )
    })
}

module.exports.userPlaylist = async function(uid, proxy = false)
{
    const result = JSON.parse(await action('/user/playlist', { uid: uid }, proxy))
    return await queue(result.playlist, async function(item)
    {
        return await mongodb.insertUserPlayList
        (
            {
                userId: item.userId,
                playlistId: item.id
            }
        )
    })
}

module.exports.user = async function(uid, proxy = false) {
    const pause = 3000
    try
    {
        if(! await module.exports.userPlaylist(uid, proxy)) return false
        await sleep(pause)
        if(! await module.exports.userFollows(uid, proxy)) return false
        await sleep(pause)
        if(! await module.exports.userFolloweds(uid, proxy)) return false
        return true
    }
    catch (e)
    {
        console.log(e)
        return false
    }
};

(async function()
{
    // console.log(await module.exports.userFolloweds(config.uid, config.proxy))
    // console.log(await module.exports.userFollows(config.uid, config.proxy))
    // console.log(await module.exports.userPlaylist(config.uid, config.proxy))
    console.log(await module.exports.user(config.uid, config.proxy))
})()