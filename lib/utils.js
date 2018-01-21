const request = require('request')
// request.debug = true

const config = require('./config')
const baseUrl = config.baseUrl

const querystring = require('querystring')

module.exports.sleep = function(ms)
{
    return new Promise(function(resolve)
    {
        setTimeout(function()
        {
            resolve()
        }, ms)
    })
}

const get = function(url)
{
    return new Promise(function(resolve, reject)
    {
        request.get({ url: url, timeout: 30000 }, function(error, res, body)
        {
            if(error)
            {
                reject(error)
            }
            else
            {
                resolve(body)
            }
        })
    })
}

module.exports.action = async function(path, query, proxy = false)
{
    let url = `${baseUrl}${path}?${querystring.stringify(query)}`
    if (proxy)
    {
        url = url + `&proxy=${proxy}`
    }
    console.log(url)
    let fail = 0
    let res = null
    while (fail < 10)
    {
        try
        {
            res = await get(url)
            break
        }
        catch (e)
        {
            console.error(e)
            console.log(`[action] failed for ${fail} times, retrying...(${10 - fail} left)`)
            fail ++
        }
    }
    if (res === null)
    {
        throw new Error(`[action] failed for 10 times, canceled`)
    }
    else
    {
        return res
    }
}

module.exports.queue = async function(array, action)
{
    let failure = 0
    while (array.length > 0)
    {
        const item = array.pop()
        try
        {
            await action(item)
        }
        catch (e)
        {
            // if(e.code === 11000) continue
            failure ++
            console.warn(`[queue] action failed, total: ${failure}`)
            array.unshift(item)
            if(failure > 10)
            {
                throw new Error('[queue] action failed more than 10 times')
            }
        }
    }
    return true
}