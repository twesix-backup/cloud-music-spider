const config = require('../config')
const follow = require('../actions/user.follow')
const utils = require('../utils')

// dead loop on every proxy, never resolve
const loop = async function(proxy)
{
    console.log(`[loop] proxy ${proxy} is on dead loop`)
    while(1)
    {
        await follow(false, proxy)
        await utils.sleep(5000)
    }
};

(async function()
{
    // await mongodb.clearLocks('user')
    for(let i = 0; i < config.proxyList.length; i ++)
    {
        loop(config.proxyList[i])
    }
})()