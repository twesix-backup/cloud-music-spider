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

module.exports.clearLocks = async function(name)
{
    return await action(async function()
    {
        const db = await $conn
        console.log(`[clearLocks] start to clear all locks of ${name}`)
        const res = await db.collection(name).updateMany
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
        console.log(`[clearLocks] cleared ${res.result.n} locks of ${name}`)
        return true
    })
}

//----------- users, following--------------------------------------------------------------------------------

module.exports.insertUserUnprocessed = async function(user)
{
    return await action(async function()
    {
        const db = await $conn
        const user1 = await db.collection('user').findOne
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
        await db.collection('user').insertOne(user)
        return true
    })
}

module.exports.updateUserProcessed = async function(id)
{
    return await action(async function()
    {
        const db = await $conn
        console.log(`[updateUserProcessed] set user ${id} processed`)
        await db.collection('user').updateOne
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
        const response = await db.collection('user').findOneAndUpdate
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

module.exports.insertFollow = async function(follow)
{
    return await action(async function()
    {
        const db = await $conn
        console.log(`[insertFollow] insert one following : ${follow.from} is following ${follow.to}`)
        await db.collection('follow').updateOne
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

//-------------- music  -------------------------------------------------------------------------

module.exports.insertMusicUnprocessed = async function(music)
{
    return await action(async function()
    {
        const db = await $conn
        const _music = await db.collection('music').findOne({ musicId: music.musicId })
        if(_music)
        {
            console.log(`[insertMusicUnprocessed]  music : ${music.musicId} already exist, canceled`)
            return true
        }
        music._processed = false
        music._processing = false
        console.log(`[insertSongUnprocessed] insert one unprocessed music: ${music.musicId}`)
        await db.collection('music').insertOne(music)
        return true
    })
}

module.exports.updateMusicProcessed = async function(id)
{
    const db = await $conn
    console.log(`[updateMusicProcessed] set music ${id} processed`)
    await db.collection('music').updateOne
    (
        {
            musicId: id
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
}

module.exports.findMusicUnprocessed = async function()
{
    return await action(async function()
    {
        const db = await $conn
        const response = await db.collection('music').findOneAndUpdate
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
        if(response.value)
        {
            console.log(`[findMusicUnprocessed] find one processable music: ${response.value.musicId}`)
        }
        else
        {
            console.log(`[findMusicUnprocessed] can't find one processable music`)
            return null
        }
        return response.value.musicId
    })
}

//------------------comment----------------------------------

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
}

//--------------- playlist ------------------------------------------------------------------

module.exports.insertPlayListUnprocessed = async function(playlist)
{
    return await action(async function()
    {
        const db = await $conn
        const _playlist = await db.collection('playlist').findOne({playlistId: playlist.playlistId})
        if(_playlist)
        {
            console.log(`[insertPlayListUnprocessed]  playlist : ${playlist.playlistId} already exist, canceled`)
            return true
        }
        playlist._processed = false
        playlist._processing = false
        await db.collection('playlist').insertOne(playlist)
        console.log(`[insertPlayListUnprocessed] insert one playlist : user[${playlist.userId}] --> playlistId[${playlist.playlistId}]`)
        return true
    })
}

module.exports.updatePlaylistProcessed = async function(id)
{
    return await action(async function()
    {
        const db = await $conn
        console.log(`[updatePlaylistProcessed] set playlist ${id} processed`)
        await db.collection('playlist').updateOne
        (
            {
                'playlistId': id
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

module.exports.findPlaylistProcessed = async function()
{
    return await action(async function()
    {
        const db = await $conn
        const response = await db.collection('playlist').findOneAndUpdate
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
            console.log(`[findPlaylistUnprocessed] find one processable playlist: ${response.value.playlistId}`)
        }
        else
        {
            console.log(`[findPlaylistUnprocessed] can't find one processable playlist`)
            return null
        }
        return response.value.playlistId
    })
}

//------------------------------------------------------------------------------

const clean = async function()
{
    const db = await $conn
    return db.collection('comment').deleteMany({})
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
    //
    // console.log(await module.exports.insertFollow({ from: 'test', to: 'test1' }))
    // console.log(await module.exports.insertFollow({ from: 'test', to: 'test1' }))
    
    
    // const playlist1 =
    //     {
    //         userId: 'test1',
    //         playlistId: 'test1'
    //     }
    // const playlist2 =
    //     {
    //         userId: 'test2',
    //         playlistId: 'test2'
    //     }
    //
    // const db = await $conn
    // console.log(await db.collection('playlist').findOneAndDelete(playlist1))
    // console.log(await db.collection('playlist').findOneAndDelete(playlist2))
    //
    // console.log(await module.exports.insertPlayListUnprocessed(playlist1))
    // console.log(await module.exports.insertPlayListUnprocessed(playlist2))
    //
    // console.log(await module.exports.findPlaylistProcessed())
    // console.log(await module.exports.findPlaylistProcessed())
    //
    // console.log(await module.exports.updatePlaylistProcessed('test1'))
    // console.log(await module.exports.updatePlaylistProcessed('test2'))
    
    // const music1 =
    //     {
    //         musicId: 'test1',
    //         name: 'test1'
    //     }
    // const music2 =
    //     {
    //         musicId: 'test2',
    //         name: 'test2'
    //     }
    //
    // const db = await $conn
    // console.log(await db.collection('music').findOneAndDelete(music1))
    // console.log(await db.collection('music').findOneAndDelete(music2))

    // await module.exports.insertMusicUnprocessed(music1)
    // await module.exports.insertMusicUnprocessed(music2)
    //
    // await module.exports.findMusicUnprocessed()
    // await module.exports.findMusicUnprocessed()
    //
    // await module.exports.updateMusicProcessed('test1')
    // await module.exports.updateMusicProcessed('test2')
    
    // await module.exports.insertComment({ id: 'test', content: 'the comment'})
    // await module.exports.insertComment({ id: 'test', content: 'the comment'})
    
    // console.log(await clean())
    
    // const db = await $conn
    // let num = 0
    // while(1)
    // {
    //     try
    //     {
    //         const res = await db.collection('playlist').findOneAndUpdate
    //         (
    //             {
    //                 _processing:
    //                     {
    //                         $exists: false
    //                     },
    //                 _processed: false
    //             },
    //             {
    //                 $set:
    //                     {
    //                         _processing: false,
    //                     }
    //             }
    //         )
    //         if(! res.lastErrorObject.updatedExisting)
    //         {
    //             return
    //         }
    //         num ++
    //     }
    //     catch(e)
    //     {
    //         console.log(e)
    //     }
    //     console.log(num)
    // }
})
()