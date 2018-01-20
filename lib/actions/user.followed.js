const utils = require('../utils')
const sleep = utils.sleep
const action = utils.action
const queue = utils.queue
const user = require('../db/mongodb/user')

const insertFollow = user.insertFollow
const insertUserUnprocessed = user.insertUserUnprocessed
const updateUserFollowedProcessed = user.updateUserFollowedProcessed
const findUserFollowedUnprocessed = user.findUserFollowedUnprocessed

const followed = async function(uid, proxy = false, offset = 0, limit = 100)
{
    const result = JSON.parse
    (
        await action('/user/followeds', { uid: uid, offset: offset, limit: limit }, proxy)
    )
    await queue(result.followeds, async function(item)
    {
        await insertFollow
        (
            {
                from: item.userId,
                to: uid
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
    if (result.more)
    {
        await sleep(1000)
        await followed(uid, proxy, offset + limit)
    }
}

module.exports = async function(uid, proxy = false)
{
    try
    {
        if(! uid)
        {
            uid = await findUserFollowedUnprocessed()
        }
        console.log(`[user.followed] processing user: ${uid}, using proxy: ${proxy}`)
        await followed(uid, proxy)
        await updateUserFollowedProcessed(uid)
        console.log(`[user.followed] user: ${uid} processed`)
    }
    catch (e)
    {
        console.warn(e)
        console.log(`[user.followed] failed to process user: ${uid}`)
    }
}

;(async function()
{
    await module.exports()
})()