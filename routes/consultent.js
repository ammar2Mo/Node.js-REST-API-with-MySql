var { consultent, Advisor, usersPakeges, pakeges, consultation, messages, consultentComplaints  } = require('../models/index')
var { dispatchSuc, dispatchErr, checkLoginToken, prepareInput, createUuid, checkLocations } = require('../tools/tools')

let calculateExpirey = (expiryPeriod) => {
    return expiryPeriod + new Date().getTime()
}


let addConsultation = (req, res, next) => {
    //var rowConsult = req.body
    let consultentId = req.params.id



    usersPakeges.findOne({
        where: {
            consultentId: consultentId,
            status: 'active',
            expiry: {
                $gte: new Date().getTime()
            }
        }
    }).then((userPakege) => {
        if (userPakege === null) {
            dispatchErr(res, ["Sorry, you have to join in packege"])
            return
        }

        consultation.findOne({
            where: {
                consultentId: consultentId,
                status: {
                    $ne: 'solved'
                }
            }
        }).then((userConsult) => {
            if (userConsult !== null) {
                dispatchErr(res, [" You shoud finish all consultation "])
                return
            }
            var Consult = { id: createUuid(), consultentId: consultentId, userpakegeId: userPakege.id }


            consultation.create(Consult)
                .then(() => {
                    pakeges.findById(userPakege.pakegeId)
                        .then((pakege) => {
                            consultation.count({ where: { consultentId: consultentId, userPakegeId: userPakege.id } })
                                .then((consultationNum) => {
                                    if (consultationNum == pakege.numOfConsultation) {
                                        usersPakeges.update({ status: 'disActive' }, { where: { id: userPakege.id } })
                                    }
                                    dispatchSuc(res, { consultationId: Consult.id })
                                }).catch((err) => dispatchErr(res, [err]))
                        }).catch((err) => dispatchErr(res, [err]))

                }).catch((err) => dispatchErr(res, [err]))

        }).catch((err) => dispatchErr(res, [err]))

    }).catch((err) => dispatchErr(res, [err]))



}

let addComplaintion = (req, res, next) => {
    let consultentId = req.body.consultentId
    let rowComplaintionInput = req.body

    consultent.findById(consultentId)
        .then((consultent) => {
            if (consultent == null) {
                dispatchErr(res, "Invalid Id")
                return
            }

            prepareInput(rowComplaintionInput)
                .then((newComplaint) => {
                    newComplaint.id = createUuid()
                    consultentComplaints.create(newComplaint)
                        .then(() => {
                            dispatchSuc(res, [])
                        }).catch((err) => dispatchErr(res, [err]))
                }).catch((err) => dispatchErr(res, [err]))

        }).catch((err) => dispatchErr(res, [err]))


}

let listConsultentComplaintion = (req, res, next) => {
    let consultentId = req.params.id
    consultentComplaints.findAll({ where: { consultentId: consultentId } })
        .then((complaints) => {
            dispatchSuc(res, complaints)
        }).catch((err) => dispatchErr(res, [err]))
}

let closeConsultation = (req, res, next) => {
    //let advisorId = req.params.id
    let consultationId = req.params.id
    if (consultationId == null || undefined) {
        dispatchErr(res, ["consultationId is not provided"])
        return
    }
    consultation.findById(consultationId)
        .then((consultation) => {
            if (consultation == null) {
                dispatchErr(res, [" Invalid consultationId "])
                return
            }
            if (consultation.status == 'solved') {
                dispatchErr(res, ["The consultation is already closed"])
            }
            consultation.update({ status: 'solved' })
                .then(() => {
                    dispatchSuc(res, [])
                }).catch((err) => dispatchErr(res, [err.message]))
        }).catch((err) => dispatchErr(res, [err.message]))

}

let joinPakege = (req, res, next) => {
    let pakegeId = req.body.pakegeId
    let consultentId = req.body.consultentId
    if (pakegeId == null || undefined) {
        dispatchErr(res, ["packegeId in not provided"]);
        return
    }
    if (consultentId == null || undefined) {
        dispatchErr(res, ["consultent in not provided"]);
        return
    }

    usersPakeges.findOne({
        where: {
            consultentId: consultentId, status: 'active',
            expiry: {
                $gte: new Date().getTime()
            }
        }
    }).then((userPakege) => {
        if (userPakege !== null) {
            dispatchErr(res, ["You have active Packege "])
            return
        } else {
            pakeges.findById(pakegeId)
                .then((package) => {
                    if (package === null) {
                        dispatchErr(res, ["Invalid PackegeId"])
                        return
                    }
                    usersPakeges.update({ status: 'disActive' }, { where: { consultentId: consultentId } })
                        .then(() => {
                            var rowUserPakege = {
                                id: createUuid(), pakegeId: pakegeId, consultentId: consultentId, date: new Date().getTime(), expiry: calculateExpirey(package.expiry)
                            }
                            usersPakeges.create(rowUserPakege).then(() => {
                                dispatchSuc(res, [])
                                return
                            }).catch((err) => dispatchErr(res, [err.message]))
                        }).catch((err) => dispatchErr(res, [err.message]))
                }).catch((err) => dispatchErr(res, [err.message]))

        }
    }).catch((err) => dispatchErr(res, [err.message]))

}

let getAllConsultion = (req , res , next)=>{
let type = req.params.type

consultation.findAll({where:{
    status:type
},
}).then((result)=>{
    dispatchSuc(res, result)
}).catch((err) => dispatchErr(res, [err.message]))

}

module.exports = {
    addConsultation, closeConsultation, joinPakege, addComplaintion, listConsultentComplaintion ,getAllConsultion
}
