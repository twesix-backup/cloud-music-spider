const utils = require('../utils')
const sleep = utils.sleep
const action = utils.action
const queue = utils.queue
const user = require('../db/mongodb/user')

const insertFollow = user.insertFollow
const insertUserUnprocessed = user.insertUserUnprocessed
const updateUserFollowProcessed = user.updateUserFollowProcessed
const findUserFollowUnprocessed = user.findUserFollowUnprocessed

const follow = async function(uid, proxy = false, offset = 0, limit = 100)
{
    const result = JSON.parse(await action('/user/follows', { uid: uid, offset: offset, limit: limit }, proxy))
    await queue(result.follow, async function(item)
    {
        await insertFollow
        (
            {
                from: uid,
                to: item.userId
            }
        ) && await insertUserUnprocessed
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
        await follow(uid, proxy, offset + limit)
    }
}

module.exports = async function(uid, proxy = false)
{
    try
    {
        if(! uid)
        {
            uid = await findUserFollowUnprocessed()
        }
        console.log(`[user.follow] processing user: ${uid}, using proxy: ${proxy}`)
        await follow(uid, proxy)
        await updateUserFollowProcessed(uid)
        console.log(`[user.follow] user: ${uid} processed`)
    }
    catch (e)
    {
        console.warn(e)
        console.log(`[user.follow] failed to process user: ${uid}`)
    }
}

;(async function()
{
    await module.exports()
})()