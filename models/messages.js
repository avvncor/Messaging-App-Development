const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    messageId:{
        type:String
    },
    wsId:{
        type:String
    },
    photos:{
        type:String
    },
    message:{
        type:String
    },
    videos:{
        type:String
    },
    mobileNo:{
        type:String
    },
    file:{
        type:String
    },
    createdAt:{
        type:Date
    },
    iv:{
        type:String
    },
    key:{
        type:String
    }
})

module.exports = mongoose.model('messages',messageSchema,'messages')