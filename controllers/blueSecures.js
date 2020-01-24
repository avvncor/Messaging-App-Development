
//Keys, Connection Strings, and , Accounts
const queueName = 'bluequeue'; 
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=bhuvantechdiag;AccountKey=QogwfKTTig6t5SePwPUi/5nXeB8wxz4gM/IFA4vM6cXvx9mza+LveyC/rftDXAiIwEZcAtH0mmsDnYfTVBrMHA==;EndpointSuffix=core.windows.net';
const accountKey = 'QogwfKTTig6t5SePwPUi/5nXeB8wxz4gM/IFA4vM6cXvx9mza+LveyC/rftDXAiIwEZcAtH0mmsDnYfTVBrMHA==';
const account = 'bhuvantechdiag';
const connectionsFromApp = require('../app')
//Libraries
const { BlobServiceClient, StorageSharedKeyCredential} = require("@azure/storage-blob");
const { DefaultAzureCredential  } = require("@azure/identity");
const { ServiceBusClient, ReceiveMode } = require("@azure/service-bus");

//Initialize 
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const defaultAzureCredentials  = new DefaultAzureCredential();

const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential, defaultAzureCredentials
);


//end points
exports.sendmessage = (req, res, next) =>{
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

exports.queueOptimization = (req,res,next)=>{
 async function queue1(){
    try
    {
      connectionsFromApp.queueMessage.send({
        body:'Jmeter Testing'
      })
      return res.send('Message Sent')
    }catch(err)
    {
       console.log(err)
    }
  }

  queue1().catch(err => console.log(err))
}

exports.cosmosDbOptimization = (req,res,next) =>{
  var message = {
    message :req.body.message
  }

  async function toCosmosDbMessageItem(){
    try{
      await connectionsFromApp.cosmosDbMessage.upsert(message)
      return res.send('message sent')
    }
    catch(err){
      console.log(err)
    }
  }

  toCosmosDbMessageItem().catch(err => console.log(err))

}