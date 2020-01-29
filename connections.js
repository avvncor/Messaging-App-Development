var connection = {

}

connection.ServiceBusQueue = {
    connectionString : 'Endpoint=sb://bluesecures.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=4nQ1RLtYZDTatVMsoiY7IvGvh1fA9t9xRw3b56hROsk=',
    queueNameBlueSecures: 'bluesecures'
}

connection.StorageAccount = {
    account: 'bhuvantechdiag',
    accountKey : 'QogwfKTTig6t5SePwPUi/5nXeB8wxz4gM/IFA4vM6cXvx9mza+LveyC/rftDXAiIwEZcAtH0mmsDnYfTVBrMHA=='
}

connection.NotificationBus = {
    NotificationBusName : 'blueSecuresNH',
    NotificationBusString: 'Endpoint=sb://bluesecuresnhn.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=7QcIAWuzdsfOyP/+PgG1QreR2mRL8xGQeTKyIA6QArU='
}

connection.Xmpp = {
    service: 'bluedeepej.eastus.cloudapp.azure.com',
    domain: 'bluedeepej.eastus.cloudapp.azure',
    resource: 'web',
    username: '8899084992',
    password: '123456',
}
module.exports = connection;