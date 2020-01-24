const mongoose = require('mongoose');
const { validationResult } = require('express-validator/check')
const crypto = require('crypto')
const fs = require('fs');
var ObjectID = require('mongodb').ObjectID;
var cron = require('node-cron');
/* File Imports */
const Text = require('../models/messages')
const connections = require('../connections')
/* Imports Azure Libraries */
var azure = require('azure');
const { BlobServiceClient, StorageSharedKeyCredential} = require("@azure/storage-blob");
const { DefaultAzureCredential  } = require("@azure/identity");
const { ServiceBusClient, ReceiveMode } = require("@azure/service-bus");
const CosmosClient = require('@azure/cosmos').CosmosClient;
var iv = crypto.randomBytes(16);
// const key = process.env.K_EY;
/* Connection Strings, Keys etc */
const account = connections.StorageAccount.account
const accountKey = connections.StorageAccount.accountKey
const connectionString =  connections.ServiceBusQueue.connectionString
const queueName = connections.ServiceBusQueue.queueNameBlueSecures
var notificationHubService = azure.createNotificationHubService(connections.NotificationBus.NotificationBusName,connections.NotificationBus.NotificationBusString);
const  algorithm = process.env.AL_G,  password = process.env.WO_RD;

/** 
 * @description Cosmos 
 **/ 
const config = require('../config')
const endpoint = config.endpoint;
const key = config.key;
const client = new CosmosClient({ endpoint, key });
const databaseId = config.database.id
const containerId = config.container.cont


let image = '' ; let video = '';  let document = '';var type = '';

/**
 * @description Blob Storage 
 **/
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const defaultAzureCredentials  = new DefaultAzureCredential();

const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential, defaultAzureCredentials
);


exports.storageQueue = async ( req, res, next) =>{

  let { QueueServiceClient, StorageSharedKeyCredential } = require("@azure/storage-queue");
  let sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
   
  let queueServiceClient = new QueueServiceClient(
    `https://${account}.queue.core.windows.net`,
    sharedKeyCredential,
    {
      retryOptions: { maxTries: 4 }, // Retry options
      telemetry: { value: "BasicSample/V11.0.0" } // Customized telemetry string
    }
  );
   
   var stream =  await base64_encode(req.file.buffer)
   
   
  async function main() {
    const queueClient = queueServiceClient.getQueueClient('bfors');
    // Send a message into the queue using the sendMessage method.
    const sendMessageResponse = await queueClient.sendMessage(stream);
    console.log(
      `Sent message successfully, service assigned message Id: ${sendMessageResponse.messageId}, service assigned request Id: ${sendMessageResponse.requestId}`
    );
  }

  main()
}

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

exports.cronJob = (req, res, next)=>{
  let count = 0;
  cron.schedule('* * * * * *', () => {
      console.log('running a task every second/minute '+ count);
      count ++;
      async function main(){
        const sbClient = ServiceBusClient.createFromConnectionString(connectionString); 
        const queueClient = sbClient.createQueueClient(queueName);
        const receiver = queueClient.createReceiver(ReceiveMode.receiveAndDelete);
        
        var messageId =  mongoose.Types.ObjectId();
        var photoId = messageId +'_photo_id' + Date(Date.now())
        try{          
            const messages = await receiver.receiveMessages(1)
            var ops = await messages.map(message => message.body)
            if(ops[0].photos.toString()=== ''){
              var text = new Text({
                messageId: messageId,
                wsId : mongoose.Types.ObjectId(),
                message: ops[0].message,
                createdAt: Date(Date.now())
              })
            }
            else if(ops[0].photos.toString()!==''){
              try{
                async function main() {

                    const containerClient = blobServiceClient.getContainerClient('container1');
                    const content = ops[0].photos;
                    const blobName = photoId;
                    //  "newblob" + new Date().getTime();
                    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                    const uploadBlobResponse = await blockBlobClient.upload(content, content.length);
                    console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);

                    //


                    var text = await new Text({
                      messageId: messageId,
                      wsId : mongoose.Types.ObjectId(),
                      message: ops[0].message,
                      createdAt: Date(Date.now()),
                      photos:photoId,
                      blobRef: uploadBlobResponse.requestId
                    })

                    await text.save()
                  }
                   
                  main();
              }
              catch(err){
                res.send(err)
              }

              //
             
              await queueClient.close();
              console.log('done')

            }
           
            
        }
       catch (err){
         console.log(err)
         res.send(err)
       }
    }

    main().catch((err) => {
        console.log("Error occurred: ", err);
      });


  });
   
}

exports.postMessage = async (req,res,next) =>{
    // type = req.files.file.mimetype.split('/')[1]
    console.log('amaan')
    var iv = crypto.randomBytes(16);
    const error = validationResult(req)
    if(!error.isEmpty()){
        console.log(error)
        return res.status(422).json({Error:'No message typed'})
    }
      
      if(req.file){
        if(req.file.mimetype === 'image/png' || req.file.mimetype === 'image/jpg' || req.file.mimetype === 'image/jpeg'){
          image =  req.file.originalname;
         //  encryptFile(req,"."+req.files.file.mimetype.split('/')[1]);
           }
          else if(req.file.mimetype=== 'video/mp4' || req.file.mimetype === 'video/3gp' || req.file.mimetype === 'video/wmv'){
          video = req.file.originalname;
  
         //  encryptFile(req,"."+req.files.file.mimetype.split('/')[1]);
          }
          else if(req.file.mimetype === 'application/pdf' || req.file.mimetype === 'application/msword' || req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || req.files.file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'){
         document = req.file.originalname;
  
         //  encryptFile(req,"."+req.files.file.mimetype.split('/')[1]);
          }
          else{
          return  res.status(402).json({"Error":"File Not Supported"})
         }
      }
    
    //  const messageId = mongoose.Types.ObjectId(); const wsId = mongoose.Types.ObjectId();
     const mobileNo = req.body.mobileNo; 
     const createdAt = Date(Date.now());
     let mes = ''
      //if only text
        if(req.body.message){
            mes = req.body.message;
          if(mes.length.toString()!=='0'){
            console.log('on text')
            let messageBody = {
              // messageId: messageId.toString(),
              mobileNo:mobileNo, createdAt:createdAt,
              message: mes,
              // sessionId:'my-session'
            };
            // notification('A message has been sent you to on ' +createdAt)
            // await queueMessage(messageBody)
            await messageToCosmos(messageBody)
            res.send('message sent')
          }
        }

      //if file    
        if(image || video || document){
          if(image.length.toString()!=='0' || video.length.toString()!=='0' || document.length.toString()!=='0' ){
            console.log('in the file section')
            filename = req.file.originalname+'_'+messageId.toString()+'_'+Date.now();
            
               const blobref = await createBlob(filename, req.file)
        
               notification('A file has been sent to you on '+Date(Date.now()) )

               let messageBody = {
                messageId: messageId.toString(),
                mobileNo:mobileNo, createdAt:createdAt, type:req.file.mimetype.split('/')[1],
                file:filename
              };
              
              await queueMessage(messageBody)  
             
              await messageToCosmos(messageBody)
              res.send(messageBody)
          }
        }
       

    
    // const text = new Text({
    //    messageId:messageId, wsId:wsId,
    //     // photos:'/files/'+image, videos:'/files/'+video,
    //     photos:image, videos:video, document:document,
    //     mobileNo:mobileNo,
    //     // file: '/files/'+document,
    //     createdAt:createdAt,
    //     message:data['encryptedData'],
    //     iv:data['iv']
    //     //key:data['key']
    //    // key:key
    // })

  // return  text.save()
  //       .then(message => {
  //           return res.status(200)
  //               .json(message)
  //       })
  //       .catch(err => {
  //           console.log(err)
  //           return res.status(500).json(err)
  //       })  
 
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

function base64_encode(file) {
    // read binary data
    //var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return file.toString('base64');
}

// function to create file from base64 encoded string
function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, bitmap);
    console.log('******** File created from base64 encoded string ********');
}

notification = (message) =>{
  var payload = {
    data: {
      msg: message
    }
  };
  notificationHubService.gcm.send(null, payload, function(error){
    if(!error){
       return console.log('Notification sent')
    }
    
      console.log(error)
  });
}

createBlob = (blobName,blob)=>{
    try{
      async function main() {
          const containerClient = blobServiceClient.getContainerClient('blue');
          const content = base64_encode(blob.buffer);
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);
          const uploadBlobResponse = await blockBlobClient.upload(content, content.length);
          console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
          return uploadBlobResponse.requestId;
        }
         
        main();
  }
  catch(err){
      res.send(err)
  }
}

queueMessage = (messageBody) => {

  async function main()
      {
           try{
               const sbClient = ServiceBusClient.createFromConnectionString(connectionString);
               const queueClient = sbClient.createQueueClient(queueName)
               const sender = queueClient.createSender();
               
               sender.send({
                body:messageBody,
                // sessionId:'my-session'
               }); 
              
               console.log('message sent to the queue')
               }
              catch(err){
               console.log(err)
               }
  
       }
  
  main()
  .catch(err=>console.log(err))
  
      
}

async function messageToCosmos(itemBody) {
    const { item } = await client.database(databaseId).container(containerId).items.upsert(itemBody);
    console.log(`Created message item with id:\n${itemBody.id}\n`);
  };

  // TEST API's DOWN BELOW

exports.cosmos = (req, res, next) => {
 
  async function main(){
    const sbClient = ServiceBusClient.createFromConnectionString(connectionString); 
    const queueClient = sbClient.createQueueClient(queueName);
    const receiver = queueClient.createReceiver(ReceiveMode.receiveAndDelete);
    try{
      const message = await receiver.receiveMessages(28779)
      res.send(message)
    }
    catch(err){
      res.send(err)
    }
  }
 
  main().catch((err)=>{
    console.log(err)
  })
 
  
}

exports.Queue = (req, res, next) =>{
  async function main(){
    try{
    const sbClient = ServiceBusClient.createFromConnectionString(connectionString);
    const queueClient = sbClient.createQueueClient(queueName)
    const sender = queueClient.createSender();

    await sender.send({
      body:req.body.message,
      // sessionId:'my-session'
     });
      await queueClient.close();
      console.log('successful')
      return res.send('Sent message')
    }
    catch(err){
      res.send(err)
      console.log(err)
    }
  }

  main().catch((err) => {
    console.log("Error occurred: ", err);
 });

}

exports.createBlob = async (req,res, next) =>{
   
  try{
      async function main() {
          const containerClient = blobServiceClient.getContainerClient('blue');
          const content = base64_encode(req.file.buffer);
          const blobName = 'blobId';
          //  "newblob" + new Date().getTime();
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);
          const uploadBlobResponse = await blockBlobClient.upload(content, content.length);
          console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
          res.send('successful')
        }
         
        main();
  }
  catch(err){
      res.send(err)
  }

}

exports.downloadBlob = async (req, res, next)=>{
  const ref = req.params.id;
  try{
       
      async function main(){
        const containerClient = blobServiceClient.getContainerClient('innovallent');
        const blobClient = containerClient.getBlobClient('newblob1576820587746');

        const downloadBlockBlobResponse = await blobClient.download();
      const file = await streamToString(downloadBlockBlobResponse.readableStreamBody).then(data=>{
          base64_decode(data,'./files/8.jpeg')
      });
      
        async function streamToString(readableStream) {
          return new Promise((resolve, reject) => {
            var chunks = [];
            readableStream.on("data", (data) => {
              chunks.push(data.toString());
            });
            readableStream.on("end", () => {

             resolve( chunks.join(""))
              
            });
            readableStream.on("error", reject);
          });
        }

      }

      main()

  }
  catch(err){
      return res.send(err)
  }

}

exports.receiveMessage =  (req, res, next)=>{

  async function main(){
      const sbClient = ServiceBusClient.createFromConnectionString(connectionString); 
      const queueClient = sbClient.createQueueClient(queueName);
      const receiver = queueClient.createReceiver(ReceiveMode.receiveAndDelete);

      try{          
          const messages = await receiver.receiveMessages(10)
          console.log("Received messages:");
          var ops = messages.map(message => message.body)
          res.send(ops)

          await queueClient.close();
      }
     catch (err){
       console.log(err)
       res.send(err)
     }
  }

  main().catch((err) => {
      console.log("Error occurred: ", err);
    });
}

exports.notification = (req,res, next)=>{
var payload = {
  data: {
    msg: 'successful'
  }
};
notificationHubService.gcm.send(null, payload, function(error){
  if(!error){
    return res.send('notification send')
  }

     res.send(error)
    console.log(error)
});
}
