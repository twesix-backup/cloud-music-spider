const utils = require('../utils')
const sleep = utils.sleep
const action = utils.action
const queue = utils.queue

const config = require('../config')
const mongodb = require('../db/mongodb')

// module.exports.playlistMusic = async function(id, proxy = false)
// {
//     const result = JSON.parse(await action('/playlist/detail', { id: id }, proxy))
//     console.log(result)
//     return
//     await queue(result.playlist, async function(item)
//     {
//         return await mongodb.insertPlayListUnprocessed
//         (
//             {
//                 musicId: item.userId,
//                 playlistId: id
//             }
//         )
//     })
// };

(async function()
{
    console.log(await module.exports.playlistMusic(config.pid, config.proxy))
    console.log(await mongodb.clearLocks('users'))
})()