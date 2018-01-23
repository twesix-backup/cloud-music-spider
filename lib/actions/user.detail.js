const utils = require('../utils')
const sleep = utils.sleep
const action = utils.action
const queue = utils.queue
const $user = require('../db/mongodb/user')
const $playlist = require('../db/mongodb/playlist')

const insertPlaylistUnprocessed = $playlist.insertPlaylistUnprocessed
const updateUserPlaylistProcessed = $user.updateUserPlaylistProcessed
const findUserPlaylistUnprocessed = $user.findUserPlaylistUnprocessed

const playlist = async function(uid, proxy = false)
{
    const result = JSON.parse(await action('/user/playlist', { uid: uid }, proxy))
    await queue(result.playlist, async function(item)
    {
        return await insertPlaylistUnprocessed
        (
            {
                userId: item.userId,
                playlistId: item.id
            }
        )
    })
}

module.exports = async function(uid, proxy = false)
{
    try
    {
        if(! uid)
        {
            uid = await findUserPlaylistUnprocessed()
        }
        console.log(`[user.playlist] processing user: ${uid}, using proxy: ${proxy}`)
        await playlist(uid, proxy)
        await updateUserPlaylistProcessed(uid)
        console.log(`[user.playlist] user: ${uid} processed`)
    }
    catch (e)
    {
        console.warn(e)
        console.log(`[user.playlist] failed to process user: ${uid}`)
    }
}

;(async function()
{
    await module.exports()
})()