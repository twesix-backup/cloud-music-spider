const utils = require('../utils')
const sleep = utils.sleep
const action = utils.action
const queue = utils.queue

const config = require('../config')
const mongodb = require('../db/mongodb')

module.exports.musicComment = async function(id, proxy = false, offset = 0, limit = 100)
{
    const result = JSON.parse(await action('/comment/music', { id, limit, offset }, proxy))
    let comments = result.comments
    if(result.hotComments)
    {
        comments = comments.concat(result.hotComments)
    }
    await queue(comments, async function(comment)
    {
        return await mongodb.insertComment
        (
            {
                musicId: id,
                commentId: comment.commentId,
                content: comment.content,
                likedCount: comment.likedCount,
                userId: comment.user.userId
            }
        )
    })
    await sleep(3000)
    if( result.more)
    {
        await module.exports.musicComment(id, proxy, offset + limit, limit)
    }
}

module.exports.music = async function(mid, proxy)
{
    try
    {
        if(! mid)
        {
            mid = await mongodb.findMusicUnprocessed()
        }
        console.log(`[music] processing music: ${mid}, using proxy: ${proxy}`)
        await module.exports.musicComment(mid, proxy)
        await mongodb.updateMusicProcessed(mid)
        console.log(`[music] music: ${mid} processed`)
    }
    catch (e)
    {
        console.warn(e)
        console.log(`[music] failed to process music: ${mid}`)
    }
};

(async function()
{
    // console.log(await mongodb.clearLocks('music'))
    // console.log(await module.exports.music(false, config.proxy))
    // console.log(await module.exports.musicComment(config.mid, config.proxy))
})()