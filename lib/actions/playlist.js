const utils = require('../utils')
const sleep = utils.sleep
const action = utils.action
const queue = utils.queue

const config = require('../config')
const mongodb = require('../db/mongodb')

module.exports.playlistMusic = async function(id, proxy = false)
{
    const result = JSON.parse(await action('/playlist/detail', { id: id }, proxy))
    const musics = result.playlist.tracks
    await queue(musics, async function(item)
    {
        return await mongodb.insertMusicUnprocessed
        (
            {
                musicId: item.id,
                name: item.name
            }
        )
    })
}

module.exports.playlist = async function(pid, proxy)
{
    const pause = 3000
    try
    {
        if(! pid)
        {
            pid = await mongodb.findPlaylistProcessed()
        }
        console.log(`[playlist] processing playlist: ${pid}, using proxy: ${proxy}`)
        await module.exports.playlistMusic(pid, proxy)
        await mongodb.updatePlaylistProcessed(pid)
        console.log(`[playlist] playlist: ${pid} processed`)
    }
    catch (e)
    {
        console.warn(e)
        console.log(`[playlist] failed to process playlist: ${pid}`)
    }
};

(async function()
{
    console.log(await mongodb.clearLocks('playlist'))
    console.log(await module.exports.playlist(false, config.proxy))
    // console.log(await module.exports.playlistMusic(config.pid, config.proxy))
})()