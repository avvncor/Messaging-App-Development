const fs = require('fs')
const express =  require('express')
const app = express();
const fileUpload = require('express-fileupload')
var http = require('http')
// var stream = fs.createReadStream(__dirname+'/files/1576350919658.jpeg');
var path = require('path')
var temp = ''
app.use(fileUpload({
  useTempFiles:true
}))

app.post('/',(req,res,next)=>{

    console.log(req.files.file)
    let file = req.files.file;
    temp = file.tempFilePath

    file.mv(temp, (err)=>{
        if(err){
          return  res.send(err)
        }
        return res.send('File Uploaded')
    })

   try{
    var readStream = fs.createReadStream(temp)
    var writeStream = fs.createWriteStream(__dirname+'/files/'+Date.now()+file.name)
    readStream.pipe(writeStream);
    writeStream.on('finish',()=>{
      console.log('done')
    })
   }
   catch(error){
    console.log(error)
   }
})

app.listen(2020)
console.log('listening')