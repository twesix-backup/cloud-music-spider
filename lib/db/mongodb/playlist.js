const mongodb = require('./index')
const $conn = mongodb.$conn
const action = mongodb.action
const date = new Date()

module.exports.insertPlaylistUnprocessed = async function(playlist)
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
};

(async function test()
{
    
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
})
()