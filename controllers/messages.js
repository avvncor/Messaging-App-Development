const mongoose = require('mongoose');
const Text = require('../models/messages')
const { validationResult } = require('express-validator/check')
const crypto = require('crypto')
var fs = require('fs');
var  algorithm = 'aes-256-ctr',  password = 'd6F3Efeq';
const key = crypto.createHash('sha256').update(String(password)).digest('base64').substr(0, 32);;
const iv = crypto.randomBytes(16);
var ObjectID = require('mongodb').ObjectID;

exports.getMessages =  (req,res,next) =>{
    var text = '';
     Text.findOne({_id:ObjectID(req.params.id)})
        .then(text =>{
            console.log(text['message']);
          var message =  decrypt(text['message'],text['iv'],text['key']);
          res.status(200).send(message);
        })
       
        .catch(err =>{
            res.status(500).json(err)
        })

}

exports.postMessage = (req,res,next) =>{
     
    const error = validationResult(req)
    if(!error.isEmpty()){
        console.log(error)
        return res.status(422).json({Error:'No message typed'})
    }
    let image = '' ; let video = '';  let document = '';
    if(req.file.mimetype === 'image/png' || req.file.mimetype=== 'image/jpg' || req.file.mimetype === 'image/jpeg'){
         image =  req.file.path;
         encryptFile(req,"."+req.file.mimetype.split('/')[1]);
    }
    else if(req.file.mimetype === 'video/mp4' || req.file.mimetype === 'video/3gp' || req.file.mimetype === 'video/wmv'){
         video = req.file.path;
         encryptFile(req,"."+req.file.mimetype.split('/')[1]);
    }
    else if(req.file.mimetype === 'application/png' || req.file.mimetype === 'application/msword' || req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || req.file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'){
         document = req.file.path;
         encryptFile(req,"."+req.file.mimetype.split('/')[1]);
    }
    else{
       return  res.status(402).json({"Error":"File Not Supported"})
    }
 
    const messageId = mongoose.Types.ObjectId(); const wsId = mongoose.Types.ObjectId();
    const mobileNo = req.body.mobileNo; 
    const createdAt = Date(Date.now());
    const mes = req.body.message;
    let data = encrypt(mes);
    const text = new Text({
       messageId:messageId, wsId:wsId,
        photos:image, videos:video,
        mobileNo:mobileNo,
        file: document,
        createdAt:createdAt,
        message:data['encryptedData'],
        iv:data['iv'],
        key:data['key']
    })

  return  text.save()
        .then(message => {
            return res.status(200)
                .json(message)
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json(err)
        })    
}

function encrypt(text) {
 let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
 let encrypted = cipher.update(text);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex'), key:key };
}

function decrypt(text,ivec,key) {
 let iv = Buffer.from(ivec, 'hex');
 let encryptedText = Buffer.from(text, 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
 return decrypted.toString();
}


/**
 * @description to encrypt file
 * @param filePath
 * @param type
 */

encryptFile = (filePath, type)=>{
    try {
        let cipher = crypto.createCipher(algorithm,password);
        //let decipher = crypto.createDecipher(algorithm,password)
        let input = fs.createReadStream(filePath.file.path);
        let fileName = './files/'+new Date().valueOf().toString().trim()+type;
        let output = fs.createWriteStream(fileName,{flags:'a'});
        input.pipe(cipher).pipe(output);
        output.on('finish',()=>{
            console.log('done')
            //decryptFile(fileName,type);
        })    
    } catch (error) {
        console.log(error);
    }
    
}

/**
 * @description to decrypt file
 * @param filePath path of file
 * @param type, type of file(mimetype)
 */
decryptFile = (filePath,type)=>{
    let decipher = crypto.createDecipher(algorithm,password)
    let input = fs.createReadStream(filePath)
    let output = fs.createWriteStream('./files/'+new Date().valueOf().toString().trim()+type,{flags:'a'});
    input.pipe(decipher).pipe(output)
    output.on('finish',()=>{
        console.log('done-image');
    })
}

exports.postTest = (req,res,next)=>{
 
function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 

 
 var hw = encrypt(req.body.message)
  const text = new Text({
      message:hw
  })
  text.save()
  .then(message =>{
      res.json(message)
  })
  .catch(err=>{
      console.log(err)
      res.json(err)
  })

}




exports.getTest = (req,res,next) => {
     Text.find({_id:req.params.id})
     .then(result =>{
        let message = result[0].message;
        console.log(message)
        function decrypt(text){
            var decipher = crypto.createDecipher(algorithm,password)
            var dec = decipher.update(text,'hex','utf8')
            dec += decipher.final('utf8');
            return dec;
          }
        var encyptedMessage = decrypt(message)
       return res.json(encyptedMessage)
     })
     .catch(err =>{
         console.log(err)
         res.json(er)
     })
}


