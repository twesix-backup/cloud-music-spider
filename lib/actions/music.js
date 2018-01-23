const utils = require('../utils')
const sleep = utils.sleep
const action = utils.action
const queue = utils.queue

const $mongodb = require('../db/mongodb')
const $comment = require('../db/mongodb/comment')
const $music = require('../db/mongodb/music')

const musicComment = async function(id, proxy = false, offset = 0, limit = 100)
{
    if (offset === 1000) return
    const result = JSON.parse(await action('/comment/music', { id, limit, offset }, proxy))
    let comments = result.comments
    if(result.hotComments)
    {
        comments = comments.concat(result.hotComments)
    }
    await queue(comments, async function(comment)
    {
        return await $comment.insertComment
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
    // await sleep(3000)
    if( result.more)
    {
        await musicComment(id, proxy, offset + limit, limit)
    }
}

module.exports = async function(mid, proxy)
{
    try
    {
        if(! mid)
        {
            mid = await $music.findMusicUnprocessed()
        }
        console.log(`[music] processing music: ${mid}, using proxy: ${proxy}`)
        await musicComment(mid, proxy)
        await $music.updateMusicProcessed(mid)
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