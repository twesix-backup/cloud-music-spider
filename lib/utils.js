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
        request.get({ url: url, timeout: 20000 }, function(error, res, body)
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
    return get(url)
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