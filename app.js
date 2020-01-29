process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const { ServiceBusClient, ReceiveMode } = require("@azure/service-bus");
const { BlobServiceClient, StorageSharedKeyCredential} = require("@azure/storage-blob");
const { DefaultAzureCredential  } = require("@azure/identity");
const CosmosClient = require('@azure/cosmos').CosmosClient;
const messageRoute = require('./routes/messages')
const bodyParser = require('body-parser')
const {client, xml, jid} = require('@xmpp/client')
const debug = require('@xmpp/debug')
const express = require('express')
const multer = require('multer');
var https = require('https');
var connections = require('./connections')
const path = require('path');
var http = require('http');
require('dotenv').config();
const config = require('./config')
var fs = require('fs');
const httpPort = 2020;
const app = express();

var sender, item;
require('events').EventEmitter.defaultMaxListeners = 40

/**
 * @description Connect to XMPP SERVER 
 */
const xmpp = client({
    service: connections.Xmpp.service,
    // domain: connections.Xmpp.domain,
    resource: connections.Xmpp.resource,
    username: connections.Xmpp.username,
    password: connections.Xmpp.password,
  })

// debug(xmpp, true)
xmpp.on('error', err => {
    console.error('We Have Error '+ err)
  })

xmpp.on('offline', () => {
    console.log('offline')
  })

  xmpp.on('status', status => {
    // console.debug(status)
    console.log(status)
  })

  xmpp.start().catch(console.error)


/***
 * @description Service Bus Queue
 * @exports Service Bus Connection String
 * @exports Service Bus Queue Name
 * @function
 */
const connectionString = connections.ServiceBusQueue.connectionString;
const queueName = connections.ServiceBusQueue.queueNameBlueSecures;

 try{
        const sbClient = ServiceBusClient.createFromConnectionString(connectionString);
        const queueClient = sbClient.createQueueClient(queueName)
        sender = queueClient.createSender();           
    }
    catch(err){
        console.log(err)
    }

/**
 * @description Cosmos Initialization 
 */
const endpoint = config.endpoint;
const key = config.key;
const clientCosmos = new CosmosClient({ endpoint, key });
const databaseId = config.database.id
const containerId = config.container.cont

item  =  clientCosmos.database(databaseId).container(containerId).items;


 
/**
 * @description Parse Json Objects
 */
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))


/***
 * @description Multer File Storage
 */
const fileStorage = multer.diskStorage({
    destination:(req, file, cb ) =>{
        cb(null,'files')
    },
    filename:(req, file, cb) => {
        cb(null, file.originalname)
    }
})

 app.use(multer({storage:multer.memoryStorage()}).single('file'))


/***
 * @description Routes
 */

app.use('/files', express.static(path.join(__dirname,'files')))
app.use('/blue-isSecure',messageRoute)

/***
 * @description Http Connection and Server
 */

var httpServer = http.createServer(app).listen(httpPort, function () {
        module.exports.queueMessage = sender;
        module.exports.cosmosDbMessage = item;
        console.log(process.env.NODE_ENV + ' server running at http://localhost:' + httpPort);
});


