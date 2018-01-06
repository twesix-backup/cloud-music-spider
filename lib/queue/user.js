const config = require('../config')
const actions = require('../actions')
const mongodb = require('../db/mongodb')

const loop = async function()
{
    for(let i = 0; i < config.proxyList.length; i ++)
    {
        const user = await mongodb.findUserUnprocessed()
        console.log(`[loop] processing user: ${user.profile.userId}`)
        if(await actions.user(user.profile.userId, config.proxyList[i]))
        {
            console.log(`[loop] user: ${user.profile.userId} processed`)
        }
        else
        {
            console.log(`[loop] failed to process user: ${user.profile.userId}`)
        }
    }
};

// (async function()
// {
//     await loop()
// })()

setInterval(async function()
{
    await loop()
}, 5000)