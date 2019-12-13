// const mongoose = require('mongoose');
// const Text = require('../models/messages')
// const { validationResult } = require('express-validator/check')
// const crypto = require('crypto')
// var  algorithm = 'aes-256-ctr',  password = 'd6F3Efeq';

// exports.getMessages =  (req,res,next) =>{
//     var text = '';
//      Text.find({_id:'5df201c0e4dd5110fc9427d8'})
//         .then(text =>{

//         })
       
//         .catch(err =>{
//             res.status(500).json(err)
//         })

// }

// exports.postMessage = (req,res,next) =>{
     
//     const error = validationResult(req)
//     if(!error.isEmpty()){
//         console.log(error)
//         return res.status(422).json({Error:'No message typed'})
//     }
//     let image = '' ; let video = '';  let document = '';
//     if(req.file.mimetype === 'image/png' || req.file.mimetype=== 'image/jpg' || req.file.mimetype === 'image/jpeg'){
//          image =  req.file.path;
//     }
//     else if(req.file.mimetype === 'video/mp4' || req.file.mimetype === 'video/3gp' || req.file.mimetype === 'video/wmv'){
//          video = req.file.path;
//     }
//     else if(req.file.mimetype === 'application/png' || req.file.mimetype === 'application/msword' || req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || req.file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'){
//          document = req.file.path;
//     }
//     else{
//        return  res.status(402).json({"Error":"File Not Supported"})
//     }
 
//     const messageId = mongoose.Types.ObjectId(); const wsId = mongoose.Types.ObjectId();
//     const mobileNo = req.body.mobileNo; 
//     const createdAt = Date(Date.now());
//     const mes = req.body.message;
//     const text = new Text({
//        messageId:messageId, wsId:wsId,
//         photos:image, videos:video,
//         mobileNo:mobileNo,
//         file: document,
//         createdAt:createdAt,
//         message:mes
//     })

//   return  text.save()
//         .then(message => {
//             return res.status(200)
//                 .json(message)
//         })
//         .catch(err => {
//             console.log(err)
//             return res.status(500).json(err)
//         })    
// }

// exports.postTest = (req,res,next)=>{
    

   

// function encrypt(text){
//   var cipher = crypto.createCipher(algorithm,password)
//   var crypted = cipher.update(text,'utf8','hex')
//   crypted += cipher.final('hex');
//   return crypted;
// }
 

 
//  var hw = encrypt(req.body.message)
//   const text = new Text({
//       message:hw
//   })
//   text.save()
//   .then(message =>{
//       res.json(message)
//   })
//   .catch(err=>{
//       console.log(err)
//       res.json(err)
//   })
// // // outputs hello world
// // console.log(decrypt(hw));
// }


// exports.getTest = (req,res,next)=>{
    
//     //console.log(req.params.id)
    
//     Text.find({_id:req.params.id})
//      .then(result =>{
//         let message = result[0].message;
//         console.log(message)
//         function decrypt(text){
//             var decipher = crypto.createDecipher(algorithm,password)
//             var dec = decipher.update(text,'hex','utf8')
//             dec += decipher.final('utf8');
//             return dec;
//           }
//         var encyptedMessage = decrypt(message)
//        return res.json(encyptedMessage)
//      })
//      .catch(err =>{
//          console.log(err)
//          res.json(er)
//      })

   
// }


