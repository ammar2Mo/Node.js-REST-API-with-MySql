var {consultent, Advisor, usersPakeges, pakeges, consultation, messages, consultentComplaints, admins} = require('../models/index')
var { dispatchSuc, dispatchErr, checkLoginToken, prepareInput, checkLocations, createUuid, sendNotification } = require('../tools/tools')
var mime = require('mime-types');
var fs = require('fs');

var multer = require('multer');


let upload = (req, res, next) => {
   
}

let assignConsultation = (consultationId, advisorId) =>
    new Promise(
        (resolve, reject) => {
            consultation.update({ status: 'active', advisorId: advisorId }, { where: { id: consultationId, status: 'pending' } })
                .then((consultation) => {
                    resolve(consultationId)
                }).catch((err) => reject([err.message]))
        }
    )

let listMessages = (consultationId, consultentComplaintsId) =>
    new Promise(
        (resolve, reject) => {
            messages.findAll({ where: { consultationId: consultationId, consultentComplaintsId: consultentComplaintsId } })
                .then((messages) => {
                    resolve(messages)
                }).catch((err) => reject([err.message]))
        }
    )

let sendMessage = (consultationId, from, to, body, attachments, consultentComplaintsId) =>
    new Promise(
        (resolve, reject) => {

            if (body !== undefined && body !== null) {
                let rowMessage = {
                    id: createUuid(), consultationId: consultationId, body: body, fromId: from, toId: to,
                    consultentComplaintsId: consultentComplaintsId
                }

                prepareInput(rowMessage)
                    .then((message) => {
                        messages.create(message)
                            .then(() => resolve())
                            .catch((err) => reject([err.message]))
                    }).catch((err) => reject([err.message]))
            } else if (attachments !== undefined && attachments !== null) {
                //upload function
                //......
            } else reject("Sorry, the message is empty")

        }
    )


let sendConsultationMessage = (req, res, next) => {
    let userId = req.params.id
    let message = req.body.message
    let consultationId = req.body.consultationId
    let attachments = req.body.attachments

    consultation.findById(consultationId)
        .then((consultation) => {
            if (consultation === null) { dispatchErr(res, ["invalid consultationId"]); return }
            if (consultation.status == 'solved') { dispatchErr(res, ["Sorry, the consultation is solved"]); return }
            Advisor.findById(userId)
                .then((advisor) => {
                    if (advisor !== null) {
                        //advisorId

                        //check consultation status
                        if (consultation.status == 'active') {
                            if (consultation.advisorId != advisor.id) {
                                dispatchErr(res, ["Sorry, this consultation is assigned to another advisor "])
                                return
                            }
                            sendMessage(consultationId, advisor.id, undefined, message, attachments)
                                .then(() => {
                                    listMessages(consultationId)
                                        .then((messages) => dispatchSuc(res, messages))
                                        .catch((err) => dispatchErr(res, [err.message]))

                                })
                                .catch((err) => dispatchErr(res, [err.message]))

                        } else if (consultation.status == 'pending') {
                            //assign consultation to advisor
                            assignConsultation(consultationId, advisor.id)
                                .then((r) => {
                                    sendMessage(consultationId, advisor.id, undefined, message, attachments)
                                        .then(() => {
                                            listMessages(consultationId, null)
                                                .then((messages) => dispatchSuc(res, messages))
                                                .catch((err) => dispatchErr(res, [err.message]))

                                        }).catch((err) => dispatchErr(res, [err]))
                                }).catch((err) => dispatchErr(res, [err.message]))
                        } else {
                            dispatchErr(res, ["Sorry the consultation is solved! "])
                            return
                        }


                    } else {
                        //consultentId
                        consultent.findById(userId)
                            .then((consultent) => {
                                if (consultent == null) { dispatchErr(res, ["Invalid Id"]); return }
                                sendMessage(consultationId, consultent.id, undefined, message, attachments)
                                    .then(() => {
                                        listMessages(consultationId, null)
                                            .then((messages) => dispatchSuc(res, messages))
                                            .catch((err) => dispatchErr(res, [err]))

                                    })
                                    .catch((err) => dispatchErr(res, [err]))
                            }).catch((err) => dispatchErr(res, [err.message]))

                    }
                }).catch((err) => dispatchErr(res, [err.message]))
        }).catch((err) => dispatchErr(res, [err.message]))

}

let sendComplaintsMessage = (req, res, next) => {
    let userId = req.params.id
    let message = req.body.message
    let consultentComplaintsId = req.body.consultentComplaintsId//chedk
    let attachments = req.body.attachments

    consultent.findById(userId)
        .then((consultent) => {
            if (consultent != null) {
                sendMessage(undefined, userId, undefined, message, undefined, consultentComplaintsId)
                    .then(() => {

                        listMessages(null, consultentComplaintsId)
                            .then((messages) => dispatchSuc(res, messages))
                            .catch((err) => dispatchErr(res, [err]))

                    }).catch((err) => dispatchErr(res, [err.message]))
            } else {
                admins.findById(userId)
                    .then((admin) => {
                        if (admin == null) { dispatchErr(res, "Invalid Id"); return }
                        sendMessage(undefined, userId, undefined, message, undefined, consultentComplaintsId)
                            .then(() => {

                                listMessages(null, consultentComplaintsId)
                                    .then((messages) => dispatchSuc(res, messages))
                                    .catch((err) => dispatchErr(res, [err]))

                            }).catch((err) => dispatchErr(res, [err.message]))
                    }).catch((err) => dispatchErr(res, [err.message]))
            }
        }).catch((err) => dispatchErr(res, [err.message]))
}

let getConsultations = (req, res, next) => {
    let userId = req.params.id
    Advisor.findById(userId)
        .then((advisor) => {
            if (advisor !== null) {
                //advisorId
                consultation.findAll({
                    where: { advisorId: userId },
                    include: [
                        { model: messages }
                    ]
                })
                    .then((consultations) => {
                        for (var i = 0; i < consultations.length; i++) {
                            consultations[i].dataValues.body = ((consultations[i].messages.length) == 0 ? null : consultations[i].messages[0].body)
                        }
                        dispatchSuc(res, consultations)
                    }).catch((err) => dispatchErr(res, [err.message]))

            } else {
                //consultentId
                consultent.findById(userId)
                    .then((consultent) => {
                        if (consultent == null) { dispatchErr(res, ["Invalid Id"]); return }

                        consultation.findAll({
                            where: { consultentId: userId },
                            include: [
                                { model: messages }
                            ]
                        })
                            .then((consultations) => {
                                for (var i = 0; i < consultations.length; i++) {

                                    consultations[i].dataValues.body = ((consultations[i].messages.length) == 0 ? null : consultations[i].messages[0].body)
                                }
                                dispatchSuc(res, consultations)
                            }).catch((err) => dispatchErr(res, [err.message]))

                    }).catch((err) => dispatchErr(res, [err.message]))

            }
        }).catch((err) => dispatchErr(res, [err.message]))
}

module.exports = { sendConsultationMessage, getConsultations, sendComplaintsMessage, upload }
