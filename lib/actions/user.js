const utils = require('../utils')
const sleep = utils.sleep
const action = utils.action
const queue = utils.queue

const config = require('../config')
const mongodb = require('../db/mongodb')

// 关注我的人
module.exports.userFolloweds = async function(uid, proxy = false, offset = 0, limit = 100)
{
    const result = JSON.parse
    (
        await action('/user/followeds', { uid: uid, offset: offset, limit: limit }, proxy)
    )
    await queue(result.followeds, async function(item)
    {
        await mongodb.insertFollow
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
    if (result.more)
    {
        await sleep(1000)
        await module.exports.userFolloweds(uid, proxy, offset + limit)
    }
}

module.exports.userFollows = async function(uid, proxy = false, offset = 0, limit = 100)
{
    const result = JSON.parse(await action('/user/follows', { uid: uid, offset: offset, limit: limit }, proxy))
    await queue(result.follow, async function(item)
    {
        await mongodb.insertFollow
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
    if(result.more)
    {
        await sleep(1000)
        await module.exports.userFollows(uid, proxy, offset + limit)
    }
}

module.exports.userPlaylist = async function(uid, proxy = false)
{
    const result = JSON.parse(await action('/user/playlist', { uid: uid }, proxy))
    await queue(result.playlist, async function(item)
    {
        return await mongodb.insertPlayListUnprocessed
        (
            {
                userId: item.userId,
                playlistId: item.id
            }
        )
    })
}

module.exports.user = async function(uid, proxy = false)
{
    const pause = 3000
    try
    {
        if(! uid)
        {
            uid = await mongodb.findUserUnprocessed()
        }
        console.log(`[user] processing user: ${uid}, using proxy: ${proxy}`)
        await module.exports.userPlaylist(uid, proxy)
        await sleep(pause)
        await module.exports.userFollows(uid, proxy)
        await sleep(pause)
        await module.exports.userFolloweds(uid, proxy)
        await mongodb.updateUserProcessed(uid)
        console.log(`[user] user: ${uid} processed`)
    }
    catch (e)
    {
        console.warn(e)
        console.log(`[user] failed to process user: ${uid}`)
    }
};

(async function()
{
    // console.log(await module.exports.userFolloweds(config.uid, config.proxy))
    // console.log(await module.exports.userFolloweds(1, config.proxy))
    // console.log(await module.exports.userFolloweds(1, config.proxy))
    // console.log(await module.exports.userFollows(config.uid, config.proxy))
    // console.log(await module.exports.userPlaylist(config.uid, config.proxy))
    // await module.exports.user(false, config.proxy)
    // console.log(await mongodb.clearLocks('users'))
})()