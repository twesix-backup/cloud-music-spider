const url = `mongodb://CloudMusic:CloudMusic@base.twesix.cn:27017/CloudMusic?authMechanism=SCRAM-SHA-1&authSource=CloudMusic`
const date = new Date()
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const getConnection = async function()
{
    return (await MongoClient.connect(url)).db('CloudMusic')
}

const $conn = getConnection()

//----------- users --------------------------------------------------------------------------------

module.exports.insertUserUnprocessed = async function(user)
{
    const db = await $conn
    const user1 = await db.collection('users').findOne({ id: user.id })
    if(user1)
    {
        return false
    }
    user.processed = false
    console.log(`[users] insert unprocessed user: ${user.id}`)
    return db.collection('users').insertOne(user)
}

module.exports.updateUserProcessed = async function(id)
{
    const db = await $conn
    console.log(`[users] user ${id} processed`)
    return db.collection('users').updateOne({ id: id }, { $set: { processed: true }})
}

module.exports.findUserUnprocessed = async function()
{
    const db = await $conn
    console.log(`[users] find one unprocessed user`)
    return db.collection('users').findOne({ processed: false })
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
    const db = await $conn
    console.log(`[following] insert one following: from ${follow.from} to ${follow.to}`)
    return db.collection('following').updateOne(follow, { $set: { updatedAt: date.getTime() }}, { upsert: true })
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
    await module.exports.insertUserUnprocessed({ id: 'test', name: 'test' })
    await module.exports.insertUserUnprocessed({ id: 'test', name: 'test' })
    await module.exports.insertUserUnprocessed({ id: 'test', name: 'test' })
    
    await module.exports.updateUserProcessed('test')
    await module.exports.updateUserProcessed('test')
    
    await module.exports.findUserUnprocessed()
    await module.exports.findUserUnprocessed()
    
    await module.exports.insertComment({ id: 'test', content: 'the comment'})
    await module.exports.insertComment({ id: 'test', content: 'the comment'})
    
    await module.exports.insertFollow({ from: 'test', to: 'test1' })
    await module.exports.insertFollow({ from: 'test', to: 'test1' })
    
    await module.exports.insertSongUnprocessed({ id: 'test', name: 'test'})
    await module.exports.insertSongUnprocessed({ id: 'test', name: 'test'})
    
    await module.exports.updateSongProcessed('test')
    await module.exports.updateSongProcessed('test')
    await module.exports.updateSongProcessed('test')
    
    await module.exports.findSongUnprocessed()
    await module.exports.findSongUnprocessed()
    
})
()