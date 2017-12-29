var restify = require('restify')
var restifyValidator = require('restify-validator')
var express = require('express');
var routes = require('./routes/index')
var fs = require('fs')
var server = restify.createServer()
var app = express()
server.use(restify.bodyParser())
server.use(restify.queryParser())
server.use(restifyValidator)
const publicIp = require('public-ip');
require('./globalFunctions/prototype');
require('./globalFunctions/global')

// Add headers
server.use(function (req, res, next) {

    // Website you wish to allow to connect
    // res.setHeader('Access-Control-Allow-Origin', "http://localhost:8888");

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,accept');
    res.setHeader('Access-Control-Allow-Origin', "*");
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});



//employee
server.post('/employee/:daysNum/schedule', routes.workHours.setEmployeeSchedule)
server.get('/employee/:daysNum/schedule', routes.workHours.getEmployeeSchedule)




server.listen(3000, "0.0.0.0", function () {
    publicIp.v4().then(ip => {
        console.log(ip);
        //=> '46.5.21.123'
    });
    console.log('REST API Server listening at http://localhost:3000')
})



module.exports = server
