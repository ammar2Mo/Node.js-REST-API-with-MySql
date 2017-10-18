var {admins } = require('../models/index')
var { dispatchSuc, dispatchErr, checkLoginToken, prepareInput, createUuid, cryptPass, comparePass} = require('../tools/tools')

let Sequelize = require('sequelize')

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

    admins.findOne({
        where: { email: email }
    }).then((admin) => {
        if (admin === null) {
            dispatchErr(res, 'Sorry this Password is Invalid')
            return
        }
        comparePass(password, admin.password)
            .then(() => {
                dispatchSuc(res, [])
            }).catch((err) => dispatchErr(res, err))
    }).catch((err) => dispatchErr(res, err))


}

let addAdmins = (req, res, next) => {
    let rawNewAdmin = req.body

    prepareInput(rawNewAdmin)
        .then((result) => {
            preparePass(result)
                .then((newAdmin) => {
                    newAdmin.id = createUuid()
                    admins.create(newAdmin)
                        .then(() => dispatchSuc(res, []))
                        .catch((err) => dispatchErr(res, err))
                })
                .catch((err) => dispatchErr(res, err))
        })
        .catch((err) => dispatchErr(res, err))

}

let editAdmins = (req, res, next) => {
    let adminId
    if (req.params.id === '' || req.params.id === undefined) {
        dispatchErr(res, ['No adminId '])
        return
    } else {
        adminId = req.params.id
    }

    let rawEditAdmin = req.body
    rawEditAdmin.oldPassword == undefined ? dispatchErr(res, ['No oldPassword is passed']) : rawEditAdmin.oldPassword



    admins.findById(adminId)
        .then((admin) => {
            if (admin === null) {
                dispatchErr(res, ['this user Not exists'])
                return
            }
            comparePass(rawEditAdmin.oldPassword, admin.password).then(() => {
                delete rawEditAdmin.oldPassword
                preparePass(rawEditAdmin)
                    .then((EditAdmin) => {
                        admins.update(EditAdmin, { where: { id: adminId } })
                            .then(() => dispatchSuc(res, []))
                            .catch((err) => dispatchErr(res, err))
                    })
                    .catch((err) => dispatchErr(res, err))
            })
                .catch((err) => dispatchErr(res, err))
        })
        .catch((err) => dispatchErr(res, err))

}

let deleteAdmins = (req, res, next) => {
    let adminId
    if (req.params.id === '' || req.params.id === undefined) {
        dispatchErr(res, ['No adminId '])
        return
    } else {
        adminId = req.params.id
    }

    admins.findById(adminId)
        .then((admin) => {
            if (admin === null) {
                dispatchErr(res, ['this user Not exists'])
                return
            }

                admin.destroy()
                .then(() => dispatchSuc(res, []))
                .catch((err) => dispatchErr(res, err))
            // admins.update({ isActive: false }, { where: { id: adminId } })
            //     .then(() => dispatchSuc(res, []))
            //     .catch((err) => dispatchErr(res, err))



        })
        .catch((err) => dispatchErr(res, err))

}

let getById = (req, res, next) => {
    let adminId
    if (req.params.id === '' || req.params.id === undefined) {
        dispatchErr(res, ['No adminId '])
        return
    } else {
        adminId = req.params.id
    }


    admins.findById(adminId, { attributes: { exclude: ['password'] } })
        .then((admin) => {
            if (admin === null) {
                dispatchErr(res, ['this user Not exists'])
                return
            } else {
                dispatchSuc(res, admin)
            }

        })
        .catch((err) => dispatchErr(res, err))

}

let listAdmins = (req, res, next) => {
    admins.findAll({ attributes: { exclude: ['password'] }})
        .then((admins) => dispatchSuc(res, admins))
        .catch((err) => dispatchErr(res, err))
}


module.exports = { addAdmins, listAdmins, editAdmins, getById, deleteAdmins, Login }
