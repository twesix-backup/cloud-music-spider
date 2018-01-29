const url = `mongodb://localhost:27017`
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const getConnection = async function()
{
    return (await MongoClient.connect(url, {poolSize: 200})).db('CloudMusic')
}

module.exports.action = async function(func)
{
    try
    {
        return await func()
    }
    catch (e)
    {
        console.error(e)
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

module.exports.$conn = getConnection()