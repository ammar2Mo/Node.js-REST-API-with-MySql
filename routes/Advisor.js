var { Advisor } = require('../models/index')
var { dispatchSuc, dispatchErr, checkLoginToken, createUuid, cryptPass, prepareInput, comparePass } = require('../tools/tools')

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

let Login = (req, res, next) => {
    let email
    let password = req.body.password


    if (req.body.email === undefined) {
        dispatchErr(res, 'No email')
        return
    } else {
        email = req.body.email
    }

    Advisor.findOne({
        where: { email: email }
    }).then((advisor) => {
        if (advisor === null) {
            dispatchErr(res, 'Sorry this Password is Invalid')
            return
        }

        comparePass(password, advisor.password)
            .then(() => {
                dispatchSuc(res, [])
            }).catch((err) => dispatchErr(res, err))

    }).catch((err) => dispatchErr(res, err))


}

let addAdvisor = (req, res, next) => {
    let rawNewAdvisor = req.body

    prepareInput(rawNewAdvisor)
        .then((result) => {
            preparePass(result)
                .then((newAdvisor) => {
                    newAdvisor.id = createUuid()
                    Advisor.create(newAdvisor)
                        .then(() => dispatchSuc(res, []))
                        .catch((err) => dispatchErr(res, err))
                })
                .catch((err) => dispatchErr(res, err))
        })
        .catch((err) => dispatchErr(res, err))

}

let listAdvisor = (req, res, next) => {
    Advisor.findAll({ attributes: { exclude: ['password'] } })
        .then((advisor) => dispatchSuc(res, advisor))
        .catch((err) => dispatchErr(res, err))
}

let getById = (req, res, next) => {
    let advisorId
    if (req.params.id === '' || req.params.id === undefined) {
        dispatchErr(res, ['No adminId '])
        return
    } else {
        advisorId = req.params.id
    }


    Advisor.findById(advisorId, { attributes: { exclude: ['password'] } })
        .then((advisor) => {
            if (advisor === null) {
                dispatchErr(res, ['this user Not exists'])
                return
            } else {
                dispatchSuc(res, advisor)
            }

        })
        .catch((err) => dispatchErr(res, err))

}

let editAdvisor = (req, res, next) => {
    let advisorId
    if (req.params.id === '' || req.params.id === undefined) {
        dispatchErr(res, ['No adminId '])
        return
    } else {
        advisorId = req.params.id
    }

    let rawEditAdvisor = req.body
    rawEditAdvisor.oldPassword == undefined ? dispatchErr(res, ['No oldPassword is passed']) : rawEditAdvisor.oldPassword

    Advisor.findById(advisorId)
        .then((advisor) => {
            if (advisor === null) {
                dispatchErr(res, ['this user Not exists'])
                return
            }
            comparePass(rawEditAdvisor.oldPassword, advisor.password).then(() => {
                delete rawEditAdvisor.oldPassword
                preparePass(rawEditAdvisor)
                    .then((advisorAdmin) => {
                        Advisor.update(advisorAdmin, { where: { id: advisorId } })
                            .then(() => dispatchSuc(res, []))
                            .catch((err) => dispatchErr(res, err))
                    })
                    .catch((err) => dispatchErr(res, err))
            })
                .catch((err) => dispatchErr(res, err))
        })
        .catch((err) => dispatchErr(res, err))

}

let assignAdvisor = (req, res, next) => {

}


module.exports = { addAdvisor, listAdvisor, Login, getById, editAdvisor }
