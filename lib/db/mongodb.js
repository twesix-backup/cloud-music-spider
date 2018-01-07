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
        user._processing = false
        console.log(`[insertUserUnprocessed] insert user: ${user.profile.userId}`)
        await db.collection('users').insertOne(user)
        return true
    })
}

module.exports.clearLocks = async function(name)
{
    return await action(async function()
    {
        const db = await $conn
        console.log(`[clearLocks] start to clear all locks of ${name}`)
        await db.collection(name).updateMany
        (
            {
                _processing: true
            },
            {
                $set:
                    {
                        _processing: false
                    }
            }
        )
        console.log(`[clearLocks] cleared ${result.result.n} locks of ${name}`)
        return true
    })
}

module.exports.updateUserProcessed = async function(id)
{
    return await action(async function()
    {
        const db = await $conn
        console.log(`[updateUserProcessed] set user ${id} processed`)
        await db.collection('users').updateOne
        (
            {
                'profile.userId': id
            },
            {
                $set:
                    {
                        _processed: true,
                        _processing: false
                    }
            }
        )
        return true
    })
}

// return null or user, never throw errors
module.exports.findUserUnprocessed = async function()
{
    return await action(async function()
    {
        const db = await $conn
        const response = await db.collection('users').findOneAndUpdate
        (
            {
                _processed: false,
                _processing: false
            },
            {
                $set:
                    {
                        _processing: true
                    }
            }
        )
        // console.log(response)
        if(response.value)
        {
            console.log(`[findUserUnprocessed] find one processable user: ${response.value.profile.userId}`)
        }
        else
        {
            console.log(`[findUserUnprocessed] can't find one processable user`)
            return null
        }
        return response.value.profile.userId
    })
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
    return await action(async function()
    {
        const db = await $conn
        console.log(`[insertFollow] insert one following : ${follow.from} is following ${follow.to}`)
        await db.collection('following').updateOne
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
        return true
    })
}

//--------------- user_playlist -------------------------------------------------------------------------

module.exports.insertUserPlayList = async function(item)
{
    return await action(async function()
    {
        const db = await $conn
        console.log(`[insertUserPlayList] insert one playlist : user[${item.userId}] --> playlistId[${item.playlistId}]`)
        await db.collection('user_playlist').updateOne
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
        return true
    })
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
}

const clean = async function()
{
    const db = await $conn
    return db.collection('users').deleteMany({})
};

(async function test()
{
    const user =
        {
            profile:
                {
                    userId: 'test1',
                    name: 'test1'
                },
            forTest: true
        }
    const user1 =
        {
            profile:
                {
                    userId: 'test2',
                    name: 'test2'
                },
            forTest: true
        }
    
    // console.log(await module.exports.insertUserUnprocessed(user))
    // console.log(await module.exports.insertUserUnprocessed(user1))
    // console.log(await module.exports.insertUserUnprocessed(user))
    
    // console.log(await module.exports.clearLocks('users'))
    // console.log(await module.exports.clearLocks('users'))
    //
    // console.log(await module.exports.findUserUnprocessed())
    // console.log(await module.exports.findUserUnprocessed())
    //
    // console.log(await module.exports.updateUserProcessed('test1'))
    // console.log(await module.exports.updateUserProcessed('test2'))
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
    
    // console.log(await clean())
    
})
()