const utils = require('../utils')
const sleep = utils.sleep
const action = utils.action
const queue = utils.queue
const $user = require('../db/mongodb/user')
const config = require('../config')

const findUserDetailUnprocessed = $user.findUserDetailUnprocessed
const updateUserDetailProcessed = $user.updateUserDetailProcessed
const addUserDetail = $user.addUserDetail

const detail = async function(uid, proxy = false)
{
    const result = JSON.parse(await action('/user/detail', { uid: uid }, proxy))
    if(result.profile === undefined)
    {
        console.log(result)
        throw new Error(`no profile for user: ${uid}, proxy: ${proxy}`)
    }
    await addUserDetail(result)
}

module.exports = async function(uid, proxy = false)
{
    try
    {
        if(! uid)
        {
            uid = await findUserDetailUnprocessed()
        }
        console.log(`[user.detail] processing user: ${uid}, using proxy: ${proxy}`)
        await detail(uid, proxy)
        await updateUserDetailProcessed(uid)
        console.log(`[user.detail] user: ${uid} processed`)
    }
    catch (e)
    {
        console.warn(e)
        console.log(`[user.detail] failed to process user: ${uid}`)
    }
}

;(async function()
{
    // await module.exports()
    // await module.exports(config.uid, config.proxy)
    // await module.exports(false, 'http://cs.twesix.cn:65535')
})()