const mongodb = require('./index')
const $conn = mongodb.$conn

;(async function()
{
    const $db = await $conn
    const $user = $db.collection('user')
    const $playlist = $db.collection('playlist')
    const $follow = $db.collection('follow')
    const $comment = $db.collection('comment')
    const $music = $db.collection('music')
    
    const result =  await $user.updateMany
    (
        {},
        {
            $unset:
                {
                    _processed: 1,
                    _processing: 1
                },
            // $set:
            //     {
            //         __processed:
            //             {
            //                 follow: false,
            //                 followed: false,
            //                 playlist: false,
            //                 detail: false
            //             },
            //         __processing:
            //             {
            //                 follow: false,
            //                 followed: false,
            //                 playlist: false,
            //                 detail: false
            //             },
            //     }
        }
    )
    
    console.log(result)
})()