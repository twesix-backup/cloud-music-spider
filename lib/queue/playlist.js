const config = require('../config')
const playlist = require('../actions/playlist')
const utils = require('../utils')

// dead loop on every proxy, never resolve
const loop = async function(proxy)
{
    console.log(`[loop] proxy ${proxy} is on dead loop`)
    while(1)
    {
        await playlist.playlist(false, proxy)
        await utils.sleep(5000)
    }
};

(async function()
{
    for(let i = 0; i < config.proxyList.length; i ++)
    {
        loop(config.proxyList[i])
    }
})()