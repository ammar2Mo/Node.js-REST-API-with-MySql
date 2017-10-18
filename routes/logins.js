let request = require('request-promise')
let { UserVerificationCo, consultent, forgetPassword, usersPakeges, pakeges, consultation} = require('../models/index')
var { getUser, dispatchSuc, dispatchErr, checkUserConsistency, createToken,
    checkLoginToken, checkPermissions, prepareInput, updateUser, createUuid, checkLocations, cryptPass,
    uploadPicture, comparePass } = require('../tools/tools')

let {getCode, getPassword} = require('../f-emal-temp')
let sendmail = require('sendmail')({ silent: true })
let Random = require('random-js')
let nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ammarshabrawy@gmail.com',
        pass: 'hguhgl22'
    }
});

// Create random code between 0000 and 9999
let createCode = () =>
    new Promise(
        (resolve, reject) => {
            let random = new Random(Random.engines.browserCrypto)
            let code = String(random.integer(0, 9999))
            while (code.length < 4) {
                code = `0${code}`
            }
            resolve({ code: code })
        }
    )


// Encrypt password (if present)
let preparePass = (results) =>
    new Promise(
        (resolve, reject) => {
            if (results.password === undefined) {
                resolve(results)
            } else {
                cryptPass(results.password)
                    .then((encPass) => {
                        results.password = encPass
                        resolve(results)
                    })
                    .catch((err) => reject([err]))
            }
        }
    )

// /email/verify route and update user code
let verify = (req, res, next) => {
    var email;
    if (req.body.email === '' || req.body.email === undefined) {
        dispatchErr(res, ['No email address'])
        return
    } else {
        email = req.body.email
    }

    var user = req.body

    // Create random code between 0000 and 9999
    let createCode = () =>
        new Promise(
            (resolve, reject) => {
                let random = new Random(Random.engines.browserCrypto)
                let code = String(random.integer(0, 9999))
                while (code.length < 4) {
                    code = `0${code}`
                }
                resolve({ code: code })
            }
        )




    // Send code to provided email
    let sendCode = (receiver, data) =>
        new Promise(
            (resolve, reject) => {
                if (data.code === undefined || data.code === '') reject(['Invalid code'])
                let mailOptions = {
                    from: '"Mostshark" <ammarshabrawy@gmail.com>', // sender address
                    to: receiver, // list of receivers
                    subject: 'mustshark Verification Code', // Subject line
                    // text: 'Hello world ?', // plain text body
                    html: getCode(data.code) // html body
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (err) {
                        return reject([err.stack])
                    }
                    console.log('Message %s sent: %s', info.messageId, info.response);
                    resolve(data)
                });
            }
        )

    // Add record to UserVerificationCo or update existing one
    let saveCode = (data, user) =>
        new Promise(
            (resolve, reject) => {
                UserVerificationCo.find({
                    where: {
                        userId: user.id
                    }
                })
                    .then((record) => {

                        if (record !== null) {
                            // If record exists update it
                            let where = { where: { userId: user.id } }
                            UserVerificationCo.update({
                                code: data.code,
                                sentAt: Math.floor(Date.now() / 1000)
                            }, where)
                                .then(() => resolve())
                                .catch((err) => reject([err.message]))
                        } else {
                            if (user.email == undefined) {
                                dispatchErr(res, ['this user is already verified'])
                                return
                            }
                            let newData = {
                                code: data.code,
                                sentTo: user.email,
                                sentAt: Math.floor(Date.now() / 1000)
                            }
                            // Create a new record
                            newData.userId = user.id
                            UserVerificationCo
                                .create(newData)
                                .then(() => resolve())
                                .catch((err) => reject([err.message]))
                        }
                    })
                    .catch((err) => reject([err.message]))
            }
        )



    let userId = req.body.userId
    if (userId != undefined) {
        createCode()
            .then((data) => {
                user = { id: userId }
                saveCode(data, user)
                    .then(() => {
                        let newData = {
                            status: 'pending'
                        }

                        dispatchSuc(res, user)
                        sendCode(email, data)
                    })
                    .catch((err) => dispatchErr(res, err))
            })
            .catch((err) => dispatchErr(res, err))
    } else {
        prepareInput(user)
            .then((result) => {
                preparePass(result)
                    .then((newUser) => {
                        newUser.id = createUuid()
                        newUser.status = 'pending'
                        consultent.create(newUser)
                            .then(() => {

                                ////verify

                                createCode()
                                    .then((data) => {
                                        saveCode(data, newUser)
                                            .then(() => {
                                                let newData = {
                                                    status: 'pending'
                                                }

                                                dispatchSuc(res, newUser)
                                                sendCode(newUser.email, data)
                                            })
                                            .catch((err) => dispatchErr(res, err))
                                    })
                                    .catch((err) => dispatchErr(res, err))


                            })
                            .catch((err) => dispatchErr(res, err))
                    })
                    .catch((err) => dispatchErr(res, err))
            })
            .catch((err) => dispatchErr(res, err))
    }



}

let Login = (req, res, next) => {
    let email
    let password = req.body.password


    if (req.body.email === undefined) {
        dispatchErr(res, 'No email')
        return
    } else {
        email = req.body.email
    }

    consultent.findOne({
        where: { email: email }
    }).then((consultent) => {
        if (consultent === null) {
            dispatchErr(res, 'Sorry this Password is Invalid')
            return
        }

        comparePass(password, consultent.password)
            .then(() => {
                usersPakeges.findOne({ where: { consultentId: consultent.id, status: "active" } })
                    .then((pakege) => {
                        var pakegeStatus;
                        try {
                            if (pakege === null) {
                                pakegeStatus = { isActive: false, reason: "انت غير مشترك في ياقه حاليا" }
                            } else {
                                let expireDate = (pakege.date).getTime() + pakege.expiry
                                if (expireDate < Date.now()) {
                                    usersPakeges.update({ status: "disActive" }, { where: { id: pakege.id } })
                                    pakege.expireDate = expireDate
                                    pakegeStatus = { isActive: false, reason: "لقد انتهت صلاحية الباقه السابقه  لانتهاء تاريخ صلاحيتها", pakege: pakege }
                                } else {
                                    pakege.expireDate = expireDate
                                    pakeges.findById(pakege.pakegeId)
                                        .then((pak) => {

                                            consultation.count({ where: { userPakegeId: pakege.id } })
                                            .then((consNum) => {
                                            if (consNum == pak.numOfConsultation) {
                                                usersPakeges.update({ status: "disActive" }, { where: { id: pakege.id } })
                                                pakegeStatus = { isActive: false, reason: "لقد انتهت صلاحية الباقه السابقه لنفاذ عدد الاستشارات", pakege: pakege }
                                            } else {

                                                let availableConsultionNum = pak.numOfConsultation - consNum
                                                pakegeStatus = { isActive: true, pakege: pakege, availableConsultionNum: availableConsultionNum }
                                                var result = { profile: consultent, pakegeStatus: pakegeStatus }
                                                dispatchSuc(res, result)
                                            }
                                        }).catch((err) => dispatchErr(res, err))
                                    }).catch((err) => dispatchErr(res, err))

                                }
                            }
                        }
                        catch (e) {
                            console.log(e)
                        }
                        //list consultions and comittion 
                        
                    }).catch((err) => dispatchErr(res, err))

            }).catch((err) => dispatchErr(res, err))

    }).catch((err) => dispatchErr(res, err))


}

// /email/checkcode route
let checkCode = (req, res, next) => {

    if (req.query.email === '' || req.query.email === undefined) {
        dispatchErr(res, ['No email provided'])
    } else {
        var email = req.query.email
    }

    let code = req.query.code

    // Searches the record for the given code & userId
    // if found deletes it
    let findCode = (userId) =>
        new Promise(
            (resolve, reject) => {
                if (code === '' || code === undefined) {
                    reject(['No code provided'])
                    return
                }
                UserVerificationCo.findOne({
                    where: {
                        userId: userId,
                        code: code
                    }
                })
                    .then((record) => {
                        if (record === null) {
                            reject(['Invalid code'])
                            return
                        }
                        record.destroy()
                            .then(() => resolve())
                            .catch((err) => reject([err.message]))
                    })
                    .catch((err) => dispatchErr(res, [err.message]))
            }
        )

    // Shared method to update User's status
    let updateUserStatus = (self, newData) =>
        new Promise(
            (resolve, reject) => {
                let where = { where: { id: self } }
                consultent.findOne({ where: { id: self } })
                    .then((user) => {
                        if (user == null) {
                            reject({ message: 'No user found....' });
                        }
                        else {
                            consultent.update(newData, where)
                                .then(() => resolve())
                                .catch((err) => reject([err.message]))
                        }
                    })
            })


    // This Promises chain no longer requires a loginToken but
    // instead an userId. Then searches in the UserVerificationCo
    // table for a record that corresponds with the code && userId,
    // if so deletes the record and updates user's status to 'verified'
    // and GroupUsers to 'verified'

    consultent.findOne({
        attributes: ['id'],
        where: { email: email }
    }).then((user) => {
        if (user !== null) {
            let userId = user.id
            findCode(userId)
                .then(() => {
                    let newData = {
                        status: 'verified'
                    }
                    updateUserStatus(userId, newData)
                        .then(() => dispatchSuc(res, user.id))
                        .catch((err) => dispatchErr(res, err))
                })
                .catch((err) => dispatchErr(res, err))
        } else {
            dispatchErr(res, [" user is invalid "])
            return
        }
    }).catch((err) => dispatchErr(res, err.message))

}

let resetPassword = (req, res, next) => {
    if (req.query.email === '' || req.query.email === undefined) {
        dispatchErr(res, ['No email provided'])
    } else {
        var email = req.query.email
    }

    // Send password to provided email
    let sendPassword = (receiver, data) =>
        new Promise(
            (resolve, reject) => {
                if (data.password === undefined || data.password === '') reject(['Invalid password'])

                var mailOptions2 = {
                    from: '"Mostshark" <ammarshabrawy@gmail.com>', // sender address
                    to: receiver, // list of receivers
                    subject: 'mustshark Password ', // Subject line
                    // text: 'Hello world ?', // plain text body
                    html: getPassword(data.password) // html body
                };

                transporter.sendMail(mailOptions2, (error, info) => {
                    if (err) {
                        return reject([err.stack])
                    }
                    console.log('Message %s sent: %s', info.messageId, info.response);
                    resolve(data)
                });

            }
        )

    consultent.findOne({
        where: {
            email: email
        }
    })
        .then((consultent) => {
            if (consultent === null) {
                dispatchErr(res, ['this user Not exists'])
                return
            } else {
                createCode()
                    .then((data) => {
                        var input = { id: createUuid(), code: data.code, sentTo: email, sentAt: Date.now() }
                        forgetPassword.create(input).then(() => {
                            dispatchSuc(res, [])
                            sendPassword(email, { password: data.code })
                        })
                            .catch((err) => dispatchErr(res, err))
                    })
                    .catch((err) => dispatchErr(res, err))

            }

        })
        .catch((err) => dispatchErr(res, err))


}

let updatePassword = (req, res, next) => {
    let email = req.query.email
    let code = req.body.code
    let password = req.body.password

    forgetPassword.findOne({ where: { sentTo: email, code: code } }).then((fP) => {
        if (fP == null) {
            dispatchErr(res, [])
        } else {
            preparePass({ password: password }).then((newData) => {
                consultent.update({ password: newData.password }, { where: { email: email } })
                    .then(() => {
                        dispatchSuc(res, [])
                        fP.destroy()
                    }).catch((err) => dispatchErr(res, err.message))
            }).catch((err) => dispatchErr(res, err.message))
        }
    }).catch((err) => dispatchErr(res, err.message))
}



module.exports = { checkCode, verify, Login, resetPassword, updatePassword }
