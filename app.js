const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config();
const app = express();
const dbString = 'mongodb://localhost:27017/blue-isSecure';
const messageRoute = require('./routes/messages')
const multer = require('multer');
const path = require('path');
const fileUpload = require('express-fileupload')

// const fileStorage = multer.diskStorage({
//     destination:(req, file, cb ) =>{
//         cb(null,'files')
//     },
//     filename:(req, file, cb) => {
//         cb(null, file.originalname)
//     }
// })

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
// app.use(multer({storage:fileStorage}).single('file'))
app.use(fileUpload({
    useTempFiles:true
}))
app.use('/files', express.static(path.join(__dirname,'files')))
app.use('/messages',messageRoute)

mongoose.connect(dbString,{useNewUrlParser:true, useUnifiedTopology:true})
    .then(connect =>{
        app.listen(process.env.PORT || 2020)
    console.log('listening')
    })
    .catch(err => {
        console.log(err)
    })

