process.env.NODE_ENV = process.env.NODE_ENV || 'development';
//process.env.NODE_ENV = process.env.NODE_ENV || 'uat';

var config = require('./config/config'),
    express = require('./config/express'),
    passport = require('./config/passport');
var cassandra = require('./config/cassandra');

//This portion of code is required only for SSL/HTTPs requests to handle

var fs = require('fs');
var https = require('https');
var http = require('http');
var options = {
    key: fs.readFileSync('./config/clms2018key.pem'),
    cert: fs.readFileSync('./config/clms2018cert.pem'),
    passphrase: 'iprimed@123'
};


var //db = cassandra(),
	app = express(),
    passport = passport();

module.exports = app;
//app.listen(config.port); //comment this code if you are setting it up for HTTPS

//This portion of code is required only for SSL/HTTPs requests to handle

var httpsServer = https.createServer(options, app).listen(config.port, function () {
    console.log('https server:');
    console.log(process.env.NODE_ENV + ' server running at https://localhost:' + config.port);
});

var httpServer = http.createServer(app).listen(config.httpPort, function () {
    console.log('http server:');
    console.log(process.env.NODE_ENV + ' server running at http://localhost:' + config.httpPort);
});

// console.log(process.env.NODE_ENV + ' server running at http://localhost:' + config.port);