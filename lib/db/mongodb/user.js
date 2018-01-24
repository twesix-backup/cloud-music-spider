const mongodb = require('./index')
const $conn = mongodb.$conn
const action = mongodb.action
const date = new Date()

module.exports.clearLocks = async function(name)
{
    return await action(async function()
    {
        const db = await $conn
        console.log(`[clearLocks] start to clear all locks of user.${name}`)
        const $query = {}
        $query['__processing.' + name] = true
        const $set = {}
        $set['__processing.' + name] = false
        const res = await db.collection('user').updateMany($query, { $set })
        console.log(`[clearLocks] cleared ${res.result.n} locks of user.f${name}`)
        return true
    })
}

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
        user.__processed =
            {
                follow: false,
                followed: false,
                playlist: false
            }
        user.__processing =
            {
                follow: false,
                followed: false,
                playlist: false
            }
        console.log(`[insertUserUnprocessed] insert user: ${user.profile.userId}`)
        await db.collection('user').insertOne(user)
        return true
    })
}

module.exports.updateUserFollowProcessed = async function(id)
{
    return await action(async function()
    {
        const db = await $conn
        console.log(`[updateUserFollowProcessed] set user ${id} processed`)
        await db.collection('user').updateOne
        (
            {
                'profile.userId': id
            },
            {
                $set:
                    {
                        '__processed.follow': true,
                        '__processing.follow': false
                    }
            }
        )
        return true
    })
}

module.exports.updateUserFollowedProcessed = async function(id)
{
    return await action(async function()
    {
        const db = await $conn
        console.log(`[updateUserFollowedProcessed] set user ${id} processed`)
        await db.collection('user').updateOne
        (
            {
                'profile.userId': id
            },
            {
                $set:
                    {
                        '__processed.followed': true,
                        '__processing.followed': false
                    }
            }
        )
        return true
    })
}

module.exports.updateUserPlaylistProcessed = async function(id)
{
    return await action(async function()
    {
        const db = await $conn
        console.log(`[updateUserPlaylistProcessed] set user ${id} processed`)
        await db.collection('user').updateOne
        (
            {
                'profile.userId': id
            },
            {
                $set:
                    {
                        '__processed.playlist': true,
                        '__processing.playlist': false
                    }
            }
        )
        return true
    })
}

module.exports.updateUserDetailProcessed = async function(id)
{
    return await action(async function()
    {
        const db = await $conn
        console.log(`[updateUserDetailProcessed] set user ${id} processed`)
        await db.collection('user').updateOne
        (
            {
                'profile.userId': id
            },
            {
                $set:
                    {
                        '__processed.detail': true,
                        '__processing.detail': false
                    }
            }
        )
        return true
    })
}

module.exports.findUserFollowUnprocessed = async function()
{
    return await action(async function()
    {
        const db = await $conn
        const response = await db.collection('user').findOneAndUpdate
        (
            {
                '__processing.follow': false,
                '__processed.follow': false
            },
            {
                $set:
                    {
                        '__processing.follow': true
                    }
            }
        )
        // console.log(response)
        if(response.value)
        {
            console.log(`[findUserFollowUnprocessed] find one processable user: ${response.value.profile.userId}`)
        }
        else
        {
            console.log(`[findUserFollowUnprocessed] can't find one processable user`)
            return null
        }
        return response.value.profile.userId
    })
}

module.exports.findUserFollowedUnprocessed = async function()
{
    return await action(async function()
    {
        const db = await $conn
        const response = await db.collection('user').findOneAndUpdate
        (
            {
                '__processing.followed': false,
                '__processed.followed': false
            },
            {
                $set:
                    {
                        '__processing.followed': true
                    }
            }
        )
        // console.log(response)
        if(response.value)
        {
            console.log(`[findUserFollowedUnprocessed] find one processable user: ${response.value.profile.userId}`)
        }
        else
        {
            console.log(`[findUserFollowedUnprocessed] can't find one processable user`)
            return null
        }
        return response.value.profile.userId
    })
}

module.exports.findUserPlaylistUnprocessed = async function()
{
    return await action(async function()
    {
        const db = await $conn
        const response = await db.collection('user').findOneAndUpdate
        (
            {
                '__processing.playlist': false,
                '__processed.playlist': false
            },
            {
                $set:
                    {
                        '__processing.playlist': true
                    }
            }
        )
        // console.log(response)
        if(response.value)
        {
            console.log(`[findUserPlaylistUnprocessed] find one processable user: ${response.value.profile.userId}`)
        }
        else
        {
            console.log(`[findUserPlaylistUnprocessed] can't find one processable user`)
            return null
        }
        return response.value.profile.userId
    })
}

module.exports.findUserDetailUnprocessed = async function()
{
    return await action(async function()
    {
        const db = await $conn
        const response = await db.collection('user').findOneAndUpdate
        (
            {
                '__processing.detail': false,
                '__processed.detail': false
            },
            {
                $set:
                    {
                        '__processing.detail': true
                    }
            }
        )
        // console.log(response)
        if(response.value)
        {
            console.log(`[findUserDetailUnprocessed] find one processable user: ${response.value.profile.userId}`)
        }
        else
        {
            console.log(`[findUserDetailUnprocessed] can't find one processable user`)
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
        
        // do not reject, just try is ok
        try
        {
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
        }
        catch (e)
        {
        
        }
        return true
    })
};

module.exports.addUserDetail = async function(detail)
{
    return await action(async function()
    {
        const db = await $conn
        console.log(`[addUserDetail] add detail of user: ${detail.profile.userId}`)
        
        // do not reject, just try is ok
        try
        {
            await db.collection('user').updateOne
            (
                {'profile.userId': detail.profile.userId},
                {
                    $set:
                        {
                            ...detail
                        }
                }
            )
        }
        catch (e)
        {
        
        }
        return true
    })
};

(async function test()
{
    return
    // const user =
    //     {
    //         profile:
    //             {
    //                 userId: 'test1',
    //                 name: 'test1'
    //             },
    //         forTest: true
    //     }
    // const user1 =
    //     {
    //         profile:
    //             {
    //                 userId: 'test2',
    //                 name: 'test2'
    //             },
    //         forTest: true
    //     }
    // console.log(await module.exports.insertUserUnprocessed(user))
    // console.log(await module.exports.insertUserUnprocessed(user1))
    // console.log(await module.exports.insertUserUnprocessed(user))
    
    console.log(await module.exports.clearUserFollowLocks())
    console.log(await module.exports.clearUserFollowLocks())
    console.log(await module.exports.clearUserFollowedLocks())
    console.log(await module.exports.clearUserFollowedLocks())
    console.log(await module.exports.clearUserPlaylistLocks())
    console.log(await module.exports.clearUserPlaylistLocks())
    //
    console.log(await module.exports.findUserFollowUnprocessed())
    console.log(await module.exports.findUserFollowUnprocessed())
    console.log(await module.exports.findUserFollowedUnprocessed())
    console.log(await module.exports.findUserFollowedUnprocessed())
    console.log(await module.exports.findUserPlaylistUnprocessed())
    console.log(await module.exports.findUserPlaylistUnprocessed())
    //
    console.log(await module.exports.clearUserFollowLocks())
    console.log(await module.exports.clearUserFollowLocks())
    console.log(await module.exports.clearUserFollowedLocks())
    console.log(await module.exports.clearUserFollowedLocks())
    console.log(await module.exports.clearUserPlaylistLocks())
    console.log(await module.exports.clearUserPlaylistLocks())
    //
    console.log(await module.exports.findUserFollowUnprocessed())
    console.log(await module.exports.findUserFollowUnprocessed())
    console.log(await module.exports.findUserFollowedUnprocessed())
    console.log(await module.exports.findUserFollowedUnprocessed())
    console.log(await module.exports.findUserPlaylistUnprocessed())
    console.log(await module.exports.findUserPlaylistUnprocessed())
    //
    console.log(await module.exports.updateUserFollowProcessed('test1'))
    console.log(await module.exports.updateUserFollowProcessed('test2'))
    console.log(await module.exports.updateUserFollowedProcessed('test1'))
    console.log(await module.exports.updateUserFollowedProcessed('test2'))
    console.log(await module.exports.updateUserPlaylistProcessed('test1'))
    console.log(await module.exports.updateUserPlaylistProcessed('test2'))
    //
    const $db = await $conn
    await $db.collection('user').findOneAndDelete({'profile.userId': 'test1'})
    await $db.collection('user').findOneAndDelete({'profile.userId': 'test2'})
})
()