const request = require('request')
// request.debug = true

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

module.exports.get = function(url)
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