const config = require('../config')
const detail = require('../actions/user.detail')
const utils = require('../utils')

// dead loop on every proxy, never resolve
const loop = async function(proxy)
{
    console.log(`[loop] proxy ${proxy} is on dead loop`)
    while(1)
    {
        await detail(false, proxy)
        await utils.sleep(3000)
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