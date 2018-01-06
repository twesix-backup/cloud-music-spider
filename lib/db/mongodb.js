const url = `mongodb://CloudMusic:CloudMusic@base.twesix.cn:27017/CloudMusic?authMechanism=SCRAM-SHA-1&authSource=CloudMusic`
const date = new Date()
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const getConnection = async function()
{
    return (await MongoClient.connect(url)).db('CloudMusic')
}

const $conn = getConnection()

const action = async function(func)
{
    try
    {
        return await func()
    }
    catch (e)
    {
        console.log(e)
        return false
    }
}

//----------- users --------------------------------------------------------------------------------

module.exports.insertUserUnprocessed = async function(user)
{
    return await action(async function()
    {
        const db = await $conn
        const user1 = await db.collection('users').findOne
        (
            {
                'profile.userId': user.profile.userId
            }
        )
        if(user1)
        {
            console.log(`[insertUserUnprocessed]  user: ${user.profile.userId} already exist, canceled`)
            return true
        }
        user._processed = false
        console.log(`[insertUserUnprocessed] insert user: ${user.profile.userId}`)
        const response = await db.collection('users').insertOne(user)
        return response.result.ok === 1
    })
}

module.exports.updateUserProcessed = async function(id)
{
    const db = await $conn
    console.log(`[updateUserProcessed] set user ${id} processed`)
    try
    {
        const result = await db.collection('users').updateOne
        (
            {
                'profile.userId': id
            },
            {
                $set:
                    {
                        _processed: true
                    }
            },
            {
                upsert: true
            }
        )
        if(result.result.ok)
        {
            return true
        }
        else
        {
            return false
        }
    }
    catch (e)
    {
        console.log(e)
        return false
    }

}

// return null or user, never throw errors
module.exports.findUserUnprocessed = async function()
{
    try
    {
        const db = await $conn
        const result = await db.collection('users').findOne({ _processed: false })
        if(result !== null)
        {
            console.log(`[findUserUnprocessed] find one unprocessed user: ${result.profile.userId}`)
        }
        else
        {
            console.log(`[findUserUnprocessed] can't find one unprocessed user`)
        }
        return result
    }
    catch (e)
    {
        console.log(e)
        return null
    }
}

//-------------- comments ----------------------------------------------------------------------------

module.exports.insertComment = async function(comment)
{
    const db = await $conn
    console.log(`[comments] insert one comment: ${comment.id}`)
    return db.collection('comments').updateOne(comment, { $set: { updatedAt: date.getTime() }}, { upsert: true })
}

//-------------- following ---------------------------------------------------------------------------

module.exports.insertFollow = async function(follow)
{
    try
    {
        const db = await $conn
        console.log(`[insertFollow] insert one following : ${follow.from} is following ${follow.to}`)
        const response = await db.collection('following').updateOne
        (
            follow,
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
        if (response.result.ok)
        {
            return true
        }
        else
        {
            return false
        }
    }
    catch (e)
    {
        console.log(e)
        return false
    }
}

//--------------- user_playlist -------------------------------------------------------------------------

module.exports.insertUserPlayList = async function(item)
{
    try
    {
        const db = await $conn
        console.log(`[insertUserPlayList] insert one playlist : user[${item.userId}] --> playlistId[${item.playlistId}]`)
        const response = await db.collection('user_playlist').updateOne
        (
            item,
            {
                $set:
                    {
                        updatedAt: date.getTime(),
                        _processed: false
                    }
            },
            {
                upsert: true
            }
        )
        if (response.result.ok)
        {
            return true
        }
        else
        {
            return false
        }
    }
    catch (e)
    {
        console.log(e)
        return false
    }
}

//--------------- songs --------------------------------------------------------------------------------

module.exports.insertSongUnprocessed = async function(song)
{
    const db = await $conn
    const _song = await db.collection('songs').findOne({ id: song.id })
    if(_song)
    {
        return false
    }
    song.processed = false
    console.log(`[songs] insert one unprocessed song: ${song.id}`)
    return db.collection('songs').insertOne(song)
}

module.exports.updateSongProcessed = async function(id)
{
    const db = await $conn
    console.log(`[songs] song ${id} processed`)
    return db.collection('songs').updateOne({ id: id }, { $set: { processed: true }})
}

module.exports.findSongUnprocessed = async function()
{
    const db = await $conn
    console.log(`[songs] find one unprocessed song`)
    return db.collection('songs').findOne({ processed: false })
};

(async function test()
{
    const user =
        {
            profile:
                {
                    userId: 'test',
                    name: 'test'
                }
        }
    // console.log(await module.exports.insertUserUnprocessed(user))
    // console.log(await module.exports.insertUserUnprocessed(user))
    // console.log(await module.exports.insertUserUnprocessed(user))
    
    // console.log(await module.exports.updateUserProcessed('test'))
    // console.log(await module.exports.updateUserProcessed('test'))
    
    // console.log(await module.exports.findUserUnprocessed())
    // console.log(await module.exports.findUserUnprocessed())
    //
    // await module.exports.insertComment({ id: 'test', content: 'the comment'})
    // await module.exports.insertComment({ id: 'test', content: 'the comment'})
    //
    // console.log(await module.exports.insertFollow({ from: 'test', to: 'test1' }))
    // console.log(await module.exports.insertFollow({ from: 'test', to: 'test1' }))
    //
    // console.log(await module.exports.insertUserPlayList({ userId: 'test', playlistId: 'test1' }))
    // console.log(await module.exports.insertUserPlayList({ userId: 'test', playlistId: 'test1' }))
    //
    // await module.exports.insertSongUnprocessed({ id: 'test', name: 'test'})
    // await module.exports.insertSongUnprocessed({ id: 'test', name: 'test'})
    //
    // await module.exports.updateSongProcessed('test')
    // await module.exports.updateSongProcessed('test')
    // await module.exports.updateSongProcessed('test')
    //
    // await module.exports.findSongUnprocessed()
    // await module.exports.findSongUnprocessed()
    
})
()