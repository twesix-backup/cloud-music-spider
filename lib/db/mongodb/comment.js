const mongodb = require('./index')
const $conn = mongodb.$conn
const action = mongodb.action
const date = new Date()

module.exports.insertComment = async function(comment)
{
    return await action(async function()
    {
        const db = await $conn
        console.log(`[insertComment] insert one comment : ${comment.commentId}`)
        await db.collection('comment').updateOne
        (
            comment,
            {
                $set:
                    {
                        updatedAt: date.getTime()
                    }
            },
            {
                upsert: true
            }
        )
        return true
    })
};

(async function test()
{
    // await module.exports.insertComment({ id: 'test', content: 'the comment'})
    // await module.exports.insertComment({ id: 'test', content: 'the comment'})
})
()