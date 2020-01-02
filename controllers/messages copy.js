exports.getSubscription = (req, res, next) => {

    const topicName = 'topic_innovallent';
    const subscriptionName = "subsTest1"; 
    
    async function main(){
      
      const sbClient = ServiceBusClient.createFromConnectionString(connectionString); 
      const subscriptionClient = sbClient.createSubscriptionClient(topicName, subscriptionName);
      const receiver = subscriptionClient.createReceiver(ReceiveMode.receiveAndDelete);
    
      try {
       
        const messages = await receiver.receiveMessages(10);
        
        res.send(messages)
        console.log("Received messages:");
        console.log(messages.map(message => message.body));
    
        await subscriptionClient.close();
      } finally {
        await sbClient.close();
      }
    }
    
    main().catch((err) => {
      console.log("Error occurred: ", err);
    });
  }


  exports.sendMessageToTopics = (req, res, next)=>{
    const topicName = 'topic_innovallent';
    async function main(){
      const sbClient = ServiceBusClient.createFromConnectionString(connectionString); 
      const topicClient = sbClient.createTopicClient(topicName);
      const sender = topicClient.createSender();
    
        try {
            
              const message= {
                body: req.body.message,
                label: `test`,
             
              };
              console.log(`Sending message: ${message.body}`);
              await sender.send(message);

              await topicClient.close();
              res.send(message.body)

          } finally {
            await sbClient.close();
          }
        
    }
    
    main()
    .catch((err) => {
      console.log("Error occurred: ", err);
    });
}



exports.sendMessage = async (req, res, next) =>
{
    async function main(){
        try{
            const sbClient = ServiceBusClient.createFromConnectionString(connectionString);
        const queueClient = sbClient.createQueueClient(queueName)
        const sender = queueClient.createSender();

        await sender.send({
            body: req.body.message,
            label:'test',
            // sessionId: "my-session"
          });
          await queueClient.close();
          return res.send('Sent message')
        }
        catch(err) {
          console.log(err)
            await sbClient.close();
          }
          
    }

    main().catch((err) => {
        console.log("Error occurred: ", err);
      });
}

exports.getContainers = (req, res, next) =>{
    var arr = []
     container = {}
  try{
    async function main(){
        let i =1;
        let iter = await blobServiceClient.listContainers();
        const containerLength = iter
        for await(const container of iter){
           container['container'] = container
           arr.push(container)
        }
        return console.log(arr)
    }
    main()
  }
  catch(err){
      return json.send(err)
  }
}

exports.createContainer = (req, res, next) => {
    const containerName = req.body.container;
    async function main() {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const createContainerResponse = await containerClient.create();
      console.log(`Created container ${containerName} successfully `, createContainerResponse.requestId);
      return res.send(`Created container ${containerName} successfully, reference Id: ` + createContainerResponse.requestId)
    }
    main();
}
