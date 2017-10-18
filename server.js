var restify = require('restify')
var restifyValidator = require('restify-validator')
var express = require('express');
var routes = require('./routes/index')
var fs =require('fs')
var server = restify.createServer()
var app = express()
server.use(restify.bodyParser())
server.use(restify.queryParser())
server.use(restifyValidator)
const publicIp = require('public-ip');

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

app.get('/express',(req , res )=>{
res.send(true)
})

//admins
server.post('/admins', routes.admins.addAdmins)
server.get('/admins', routes.admins.listAdmins)
server.put('/admins/:id', routes.admins.editAdmins)
server.get('/admins/:id', routes.admins.getById)
server.del('/admins/:id', routes.admins.deleteAdmins)
server.post('/login', routes.admins.Login)

//packeges
server.post('/packeges', routes.pakeges.addPackage)
server.get('/packeges', routes.pakeges.listPackages)
server.get('/packeges/:id', routes.pakeges.getById)
server.put('/packeges/:id', routes.pakeges.editPackages)

//Advisor
server.post('/advisors', routes.Advisor.addAdvisor)
server.get('/advisors', routes.Advisor.listAdvisor)
server.post('/advisors/login', routes.Advisor.Login)
server.get('/advisors/:id', routes.Advisor.getById)
server.put('/advisors/:id', routes.Advisor.editAdvisor)

//login
server.post('/email/verify', routes.logins.verify)
server.get('/email/checkcode', routes.logins.checkCode)
server.get('/email/forgetPassword', routes.logins.forgetPassword)
server.post('/consultent/login', routes.logins.Login)

//consultation 
server.get('/consultation/:id/consultent', routes.consultent.addConsultation)
server.get('/consultation/:id/close', routes.consultent.closeConsultation)
server.post('/consultation/:id/message', routes.messages.sendConsultationMessage)
server.get('/consultation/:id', routes.messages.getConsultations)
server.get('/consultations/:type',routes.consultent.getAllConsultion)

//Complaintion
server.post('/complaintion', routes.consultent.addComplaintion)
server.get('/complaintion/:id/consultent', routes.consultent.listConsultentComplaintion)
server.post('/complaintion/:id/message', routes.messages.sendComplaintsMessage)



server.post('/consultent/joinPackege', routes.consultent.joinPakege)

server.post('/upload',(req , res , next )=>{
    var path = "./";
    var filename = req.files.file.name;

    console.log("Upload file");
    var writeStream = fs.createWriteStream(path + filename);
    var r = req.pipe(writeStream);

    res.writeHead(200, {"Content-type":"text/plain"});

    r.on("drain", function() {
            res.write(".", "ascii");
    });

    r.on("finish", function () {
            console.log("Upload complete");
            res.write("Upload complete");
            res.end();
    });
    res.send(true)

})















server.listen(4000,"0.0.0.0", function () {
    publicIp.v4().then(ip => {
    console.log(ip);
    //=> '46.5.21.123'
});
  console.log('REST API Server listening at http://localhost:4000')
})

// server.listen(4000, function () {
//     publicIp.v4().then(ip => {
//     console.log(ip);
//     //=> '46.5.21.123'
// });
//   console.log('REST API Server listening at http://localhost:4000')
// })

module.exports = server
