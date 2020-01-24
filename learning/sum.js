//callback

function run (){
    return new Promise((resolve)=>{
        return setTimeout(function (){
            print()
        },10000)
    })
}

function print(){
    console.log('printing')
}

run().then(result =>{
    console.log(result)
})