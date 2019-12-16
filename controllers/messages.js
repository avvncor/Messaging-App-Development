const mongoose = require('mongoose');
const Text = require('../models/messages')
const { validationResult } = require('express-validator/check')
const crypto = require('crypto')
var fs = require('fs');
var  algorithm = process.env.AL_G,  password = process.env.WO_RD;
const key = process.env.K_EY;
var iv = crypto.randomBytes(16);
var ObjectID = require('mongodb').ObjectID;
// const key = crypto.createHash('sha256').update(String(password)).digest('base64').substr(0, 32);


let image = '' ; let video = '';  let document = '';var type = '';
exports.getMessages =  (req,res,next) =>{
    var text = '';
     Text.findOne({_id:ObjectID(req.params.id)})
        .then(text =>{
          var message =  decrypt(text['message'],text['iv'],key);

          if(text.photos.split('/')[2].toString()!==''){
            decryptFile(text.photos)
          }
          if(text.videos.split('/')[2]!==''){
             
            decryptFile(text.videos)
          }
          if(text.file.split('/')[2]!==''){
            decryptFile(text.file)
          }
             res.status(200).send(message);
        })
        .catch(err =>{
            res.status(500).json(err)
        })
}

exports.postMessage = (req,res,next) =>{
    type = req.files.file.mimetype.split('/')[1]
    var iv = crypto.randomBytes(16);
    
    const error = validationResult(req)
    if(!error.isEmpty()){
        console.log(error)
        return res.status(422).json({Error:'No message typed'})
    }
    
    /**
    * @description Checks file type. Includes and sends path for stored and file to encrypted
    */

    if(req.files.file.mimetype === 'image/png' || req.files.file.mimetype === 'image/jpg' || req.files.file.mimetype === 'image/jpeg'){
         image =  req.files.file.name;
         encryptFile(req,"."+req.files.file.mimetype.split('/')[1]);
    }
    else if(req.files.file.mimetype=== 'video/mp4' || req.files.file.mimetype === 'video/3gp' || req.files.file.mimetype === 'video/wmv'){
         video = req.files.file.name;
         encryptFile(req,"."+req.files.file.mimetype.split('/')[1]);
    }
    else if(req.files.file.mimetype === 'application/pdf' || req.files.file.mimetype === 'application/msword' || req.files.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || req.files.file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'){
        document = req.files.file.name;;
         encryptFile(req,"."+req.files.file.mimetype.split('/')[1]);
    }
    else{
       return  res.status(402).json({"Error":"File Not Supported"})
    }

 /**
  * @description save to collection messages
  */

    const messageId = mongoose.Types.ObjectId(); const wsId = mongoose.Types.ObjectId();
    const mobileNo = req.body.mobileNo; 
    const createdAt = Date(Date.now());
    const mes = req.body.message;
    let data = encrypt(mes);
    const text = new Text({
       messageId:messageId, wsId:wsId,
        photos:'/files/'+image, videos:'/files/'+video,
        mobileNo:mobileNo,
        file: '/files/'+document,
        createdAt:createdAt,
        message:data['encryptedData'],
        iv:data['iv'],
        //key:data['key']
       // key:key
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

/**
 * @description message/text encryption
 */

function encrypt(text) {
 let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
 let encrypted = cipher.update(text);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex'), key:key };
}

/**
 * @description message/text de-encryption
 */

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

encryptFile = (filePath,type)=>{
    try {
        let cipher = crypto.createCipher(algorithm,password);
        let input = fs.createReadStream(filePath.files.file.tempFilePath);
        let fileName = './files/'+filePath.files.file.name;
       // let fileName = './files/'+new Date().valueOf().toString().trim()+type;
        let output = fs.createWriteStream(fileName,{flags:'a'});
        input.pipe(cipher).pipe(output);
        output.on('finish',()=>{
            console.log('done')
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

decryptFile = (filePath)=>{
   try{
    let decipher = crypto.createDecipher(algorithm,password)
    // let input = fs.createReadStream(filePath)
    let input = fs.createReadStream('.'+filePath)
    let output = fs.createWriteStream('./dfiles/'+filePath.split('/')[2],{flags:'a'});

    input.pipe(decipher).pipe(output)
    output.on('finish',()=>{
        console.log('done-image');
    })
   }
   catch(err){
       console.log()
       return res.send(err)
   }
}




