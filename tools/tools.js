let crypto = require('crypto')
let uuid = require('node-uuid')
let bcrypt = require('bcrypt')
let fcm = require('fcm-node')
var { Users, GroupUsers, Groups, RideRiders, Rides } = require('../models/index')
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

    UserLogins.find({
        attributes: ['deviceId'],
        where: { loginToken: loginToken }
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

            fcmCon.send(message, function (err, response) {
                if (err) {
                    console.log("Error occured!", err);
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            })
        })
        .catch((err) => reject(['Can not find user']))
}

let formatDate = (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}



//var dat = new Date();

//alert(dat.addDays(5))

module.exports = {
    dispatchSuc, dispatchErr, checkUserConsistency, createToken, createUuid, checkPermissions,
    prepareInput, checkLoginToken,
    checkLocations, cryptPass, comparePass, sendNotification, formatDate
}
