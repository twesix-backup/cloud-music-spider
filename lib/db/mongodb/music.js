const mongodb = require('./index')
const $conn = mongodb.$conn
const action = mongodb.action
const date = new Date()

module.exports.clearLocks = async function()
{
    return await action(async function()
    {
        const db = await $conn
        console.log(`[clearLocks] start to clear all locks of music`)
        const res = await db.collection('music').updateMany
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
        console.log(`[clearLocks] cleared ${res.result.n} locks of music`)
        return true
    })
}

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
};

(async function test()
{
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

})
()