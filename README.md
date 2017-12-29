

* [Node.js] - Evented I/O for the backend
* [Restify] - As backbone for the Web API
* [Sequelize] - For ORM database interaction
* [Node-uuid] - For UUID generation
* [Random-js] - For verification code generation
* [Request-promise] - For Social Network verification
* [Sendmail] - SMTP-less email sending


### Installation

The Web API requires [Node.js] v7.x+ to run.

Clone this repository, set up the database and then install the dependencies and devDependencies and start the server.

```sh
$ cd folder
$ npm install -d
$ sequelize db:migrate
$ npm start
```
**Please note that in production mode the Web Api will reject any non secure connection, so always use HTTPS.**

For dev environments...

```sh
$ cd 
$ npm install
$ npm install sequelize cli -g
$ sequelize db:migrate
$ sequelize db:seed:all
$ npm run-script development
```

###Please add employee manually in the db to start testing 

