var {pakeges } = require('../models/index')
var { getUser, dispatchSuc, dispatchErr, checkLoginToken, checkPermissions, prepareInput, updateUser, createUuid, checkLocations, cryptPass, uploadPicture } = require('../tools/tools')

let addPackage = (req, res, next) => {
    let rawNewPackege = req.body
    console.log(rawNewPackege)
    prepareInput(rawNewPackege)
        .then((newPackege) => {
            newPackege.id = createUuid()
            pakeges.create(newPackege)
                .then(() => dispatchSuc(res, []))
                .catch((err) => dispatchErr(res, err))
        })
        .catch((err) => dispatchErr(res, err))
}

let listPackages = (req, res, next) => {
    pakeges.findAll()
        .then((packeges) => dispatchSuc(res, packeges))
        .catch((err) => dispatchErr(res, err))
}

let getById = (req, res, next) => {
    let packegeId
    if (req.params.id === '' || req.params.id === undefined) {
        dispatchErr(res, ['No packegeId '])
        return
    } else {
        packegeId = req.params.id
    }


    pakeges.findById(packegeId)
        .then((packege) => {
            if (packege === null) {
                dispatchErr(res, ['this packege Not exists'])
                return
            } else {
                dispatchSuc(res, packege)
            }

        })
        .catch((err) => dispatchErr(res, err))

}

let editPackages = (req, res, next) => {
    let packegeId
    if (req.params.id === '' || req.params.id === undefined) {
        dispatchErr(res, ['No adminId '])
        return
    } else {
        packegeId = req.params.id
    }

    let rawEditPackege = req.body

    
    pakeges.findById(packegeId)
        .then((packege) => {
            if (packege === null) {
                dispatchErr(res, ['this packege Not exists'])
                return
            }
            prepareInput(rawEditPackege)
                .then((EditPackege) => {
                    pakeges.update(EditPackege, { where: { id: packegeId } })
                        .then(() => dispatchSuc(res, []))
                        .catch((err) => dispatchErr(res, err))
                })
                .catch((err) => dispatchErr(res, err))

        })
        .catch((err) => dispatchErr(res, err))

}


module.exports = { addPackage, listPackages, getById, editPackages}
