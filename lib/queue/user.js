const config = require('../config')
const actions = require('../actions')
const mongodb = require('../db/mongodb')
const utils = require('../utils')

// dead loop on every proxy, never resolve
const loop = async function(proxy)
{
    while(1)
    {
        const user = await mongodb.findUserUnprocessed()
        console.log(`[loop] processing user: ${user.profile.userId}`)
        if(await actions.user(user.profile.userId, proxy))
        {
            console.log(`[loop] user: ${user.profile.userId} processed`)
        }
        else
        {
            console.log(`[loop] failed to process user: ${user.profile.userId}`)
        }
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