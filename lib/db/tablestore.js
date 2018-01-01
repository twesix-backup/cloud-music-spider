const id = 'LTAIWVFoMNcxIgV5'
const secret = 'L6PtYCipProP5vYJ2NMl4gIPepni3K'
const url = 'https://CloudMusic.cn-beijing.ots.aliyuncs.com'

const TableStore = require('tablestore')
const Long = TableStore.Long
const client = new TableStore.Client
(
    {
        accessKeyId: id,
        secretAccessKey: secret,
        endpoint: url,
        instancename: 'CloudMusic',
    }
)

module.exports.insertComments = function(comments)
{
    const params =
        {
            tableName: 'comments',
            condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
            primaryKey: [{ id: Long.fromNumber(comments.id) }],
            attributeColumns:
            [
                { comments: comments.data }
            ],
            returnContent: { returnType: TableStore.ReturnType.Primarykey }
        }
    
    return new Promise(function(resolve, reject)
    {
        client.putRow(params, function(error, data)
        {
            if(error)
            {
                reject(error)
            }
            else
            {
                resolve(data)
            }
        })
    })
}

module.exports.deleteComments = function(id)
{
    const params =
        {
        tableName: 'comments',
        condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
        primaryKey: [{ id: Long.fromNumber(id) }]
    }
    client.deleteRow(params, function (err, data)
    {
        if(err)
        {
            console.log('error:', err)
        }
        else
        {
            console.log('success:', data)
        }
        
    })
}



async function test()
{
    await module.exports.insertComments
    (
        {
            id: '000000',
            data: 'the first comment'
        }
    )
}
(async function(){ console.log(await test()) })()