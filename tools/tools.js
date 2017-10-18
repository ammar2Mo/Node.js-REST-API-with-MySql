let crypto = require('crypto')
let uuid = require('node-uuid')
let bcrypt = require('bcrypt')
let fcm = require('fcm-node')
var { Users, GroupUsers, Groups, RideRiders, Rides} = require('../models/index')
// Create response object
let packRes = (status, content = [], validation = []) =>
  ({
    status: status,
    content: content,
    validation: validation
  })

let dispatchSuc = (res, payload) => res.send(packRes(true, payload))

let dispatchErr = (res, err) => res.send(packRes(false, undefined, err))
// Confirms userId identity
let checkUserConsistency = (userId, response) => userId === response

// Creates loginToken
let createToken = () => {
  let sha = crypto.createHash('sha256')
  sha.update(Math.random().toString())
  return sha.digest('hex')
}

// Creates an uuid
let createUuid = () => uuid.v4()

// Checks that logged user is the same who will be affected
// by the action
let checkPermissions = (loggedUser, userId) =>
  new Promise(
    (resolve, reject) => {
      if (userId === undefined) {
        reject(['Missing userId'])
      }
      if (!checkUserConsistency(loggedUser, userId)) {
        reject(['Permission denied'])
      } else {
        resolve(loggedUser)
      }
    }
  )

// Prepares input object filtering unused values
let prepareInput = (input) =>
  new Promise(
    (resolve, reject) => {
      let obj = {}
      let count = 0
      let key
      for (key in input) {
        if (Object.prototype.hasOwnProperty.call(input, key) && input[key] !== '') {
          obj[key] = input[key]
          count++
        }
      }
      count > 0
        ? resolve(obj)
        : reject(['No data passed'])
    }
  )

  // Updates the User attributes
let updateUser = (Users, userId, data) => {
  return new Promise(
    (resolve, reject) => {
      Users.find({
        attributes: { exclude: ['encPassword'] },
        where: {
          'userId': userId
        }
      })
        .then((user) => {
          if (user !== null) {
            // Update existing user
            user.updateAttributes(data)
              .then((updatedUser) => {
                let newObj = {}
                let key
                updatedUser = updatedUser.get()
                for (key in updatedUser) {
                  if (key !== 'encPassword') {
                    newObj[key] = updatedUser[key]
                  }
                }
                resolve(newObj)
              })
              .catch((err) =>
                reject([err.message])
              )
          } else {
            reject(['Unable to update'])
          }
        })
        .catch((err) => reject([err.message]))
    }
  )
}

// Checks login token against DB and returns userId
let checkLoginToken = (userLogins, loginToken) =>
  new Promise(
    (resolve, reject) => {
      if (loginToken === undefined) {
        reject(['Missing loginToken'])
      }
      userLogins.findOne({
        attributes: ['userId'],
        where: {
          loginToken: loginToken
        }
      })
      .then((userLogin) => {
        if (userLogin !== null) {
          resolve(userLogin.userId)
        } else {
          reject(['Invalid loginToken'])
        }
      })
      .catch((err) =>
        reject([err.message])
      )
    }
  )

// Checks location existence and diversity
let checkLocations = (Locations, newRide) =>
  new Promise(
    (resolve, reject) => {
      if (newRide.fromId === newRide.toId) {
        reject(['Same origin and destination'])
        return
      }
      Promise.all([
        Locations.findOne({ where: { id: newRide.fromId } }),
        Locations.findOne({ where: { id: newRide.toId } })
      ])
        .then((results) => {
          if (results[0] === null) reject(['Invalid from location'])
          if (results[1] === null) reject(['Invalid to location'])
          resolve(newRide)
        })
        .catch((err) => reject([err.message]))
    }
  )

// Encrypt password using bcrypt with salt
let cryptPass = (plainPass) =>
  new Promise(
    (resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          reject(err)
          return
        }
        bcrypt.hash(plainPass, salt, (err, hash) => {
          if (err) {
            reject(err)
          } else {
            resolve(hash)
          }
        })
      })
    }
  )

// Compare user encrypted password with user input
let comparePass = (plainPass, userEncPass) =>
  new Promise(
    (resolve, reject) => {
      bcrypt.compare(plainPass, userEncPass, (err, isMatch) => {
        if (err) {
          reject(err)
          return
        }

        if (isMatch) resolve()
          else reject(['Wrong Password'])
      })
    }
  )

//send notification to client
let sendNotification = (UserLogins, loginToken, newMessage) => {
  
  let serverKey = 'AAAA2-4_eqQ:APA91bGSj8EpsPDa_9ZC1xP76ZhX-96jFQpn_gMMz1znVWxmFNRzUL8Oie9pS4nxehRat1hZfBEqXIZBibrDfvMmNVhoEL-8KIq5s3gesiDNlfLonzguRPo0P9EBZO0LGxW-UXlnY0ndrl6FnnyTMiI4jMvuP9C3Fg';
  let fcmCon = new fcm(serverKey);
  
  UserLogins.find({ attributes: ['deviceId'],
      where: {loginToken: loginToken}
    })
    .then((user) => {
      let message = {
        to: user.deviceId,
        collapse_key: 'fcmtest',
        notification: {
          title: 'Foorera',
          body: newMessage
          }
        }

        fcmCon.send(message, function(err, response){
          if (err) {
            console.log("Error occured!", err);
          } else {
            console.log("Successfully sent with response: ", response);
          }
        })
    })
    .catch((err) => reject(['Can not find user']))
}

let uploadPicture = (imageData, userId, userInfo) =>
  new Promise(
    (resolve, reject) => {
      let decodeBase64Image = ((dataString) => {
        let matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let response = {};
        if (matches.length !== 3)
        {
          return new Error('Invalid image');
        }
        response.type = matches[1]
        response.data = new Buffer(matches[2], 'base64');
        
        return response;
      })
  
      let imageBuffer = decodeBase64Image(imageData)
      
      var uniqueRandomImageName = createUuid()
      // // This variable is actually an array which has 5 values,
      // // The [1] value is the real image extension
      var imageTypeDetected = imageBuffer
        .type
        .match(/\/(.*?)$/)
      let avatarFileName = userId +
        '.' +
        imageTypeDetected[1]
      require("fs").writeFile('/var/www/html/images/' + avatarFileName, imageBuffer.data, "base64", function(err) {
        if(err)
          reject([err.message])
        else {
          userInfo.picture = avatarFileName
          resolve(userInfo)
        }
      });
    }
  )
var getUser = (userId, res) =>
  new Promise(
  (resolve, reject) =>
    Users.findById(userId, {
      attributes: { exclude: ['encPassword'] },
      include: { model : GroupUsers, include: [Groups]},
    })
    .then((user) => {
      if(user !== null){
        let groups = [{}];
        let count = 0;
        for(i = 0; user.GroupUsers && i < user.GroupUsers.length; i++){
          if(user.GroupUsers[i].status == 'verified' && user.GroupUsers[i].Group.status == 'done')
            groups[count++] = user.GroupUsers[i].Group
        }
        user.set('Groups', groups, {raw : true})
        user.set('GroupUsers', null, {raw : true})
        RideRiders.findAll({where: {userId : userId, status: 'done'}})
          .then((rideRidersAsRider) => {
          let ratingSum = 0;
        for(i = 0; rideRidersAsRider && i < rideRidersAsRider.length; i++)
          ratingSum += rideRidersAsRider[i].riderRating !== undefined ? rideRidersAsRider[i].riderRating : 0
        RideRiders.findAll({
          where : {status : 'done'},
          include : [{
            model : Rides, as : 'ride', where : {driver : userId}
          }]
        }).
        then((rideRidersAsDriver) => {
          let ratingDriver = 0
          for(i = 0;rideRidersAsDriver &&  i < rideRidersAsDriver.length; i++)
        ratingDriver += rideRidersAsDriver[i].driverRating !== undefined ? rideRidersAsDriver[i].driverRating : 0
        let ridesCount = rideRidersAsRider.length + rideRidersAsDriver.length
        ratingSum += ratingDriver
        let averageRating = 0
        if(ridesCount > 0)
          averageRating = ratingSum / ridesCount
        let doneRide = 0
        Rides.count({where : {driver : userId, status : 'done'}})
          .then((count) => {
            doneRide = rideRidersAsRider.length + count
          user.set({rating:averageRating, completedRidesCount : doneRide}, {raw : true})
        dispatchSuc(res, user)
        })
        .catch((err) => dispatchErr(res, err))
      })
      .catch((err) => dispatchErr(res, err))
    })
    .catch((err) => dispatchErr(res, err))
  }
  else
    dispatchErr(res, ['User not found'])
  })
  .catch((err) => dispatchErr(res, [err.message]))
)
module.exports = {
    getUser, dispatchSuc, dispatchErr, checkUserConsistency, createToken, createUuid, checkPermissions,
    prepareInput, updateUser, checkLoginToken,
    checkLocations, cryptPass, comparePass, sendNotification, uploadPicture
}
