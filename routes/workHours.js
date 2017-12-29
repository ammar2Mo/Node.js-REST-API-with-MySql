var { employee, schedule, dailyWork } = require('../models/index')
var { dispatchSuc, dispatchErr, prepareInput, createUuid, formatDate } = require('../tools/tools')

let checkEmployee = (employeeId) =>
    new Promise(
        (resolve, reject) => {
            employee.findById(employeeId).then((employeeRecord) => {
                if (employeeRecord == null) {
                    reject(["Sorry ,This employee in not exists"])

                }
                if (employeeRecord.isActive == 0) {
                    reject(["Sorry ,This employee in not active"])
                }
                console.log(employeeRecord.isActive)
                resolve(employeeRecord.isActive)

            }).catch((err) => reject(err))
        }
    )




let checkDailyWork = (employeeId, startTime, hours) =>
    new Promise(
        (resolve, reject) => {
            dailyWork.findOrCreate({
                where: { employeeId: employeeId, date: prepareDateOnly(startTime) },
                defaults: { totalHours: hours, id: createUuid(), employeeId: employeeId, date: prepareDateOnly(startTime), isHollyDay: true }
            })
                .spread((dailyWorkRecoed, created) => {
                    if (created) {
                        resolve(dailyWorkRecoed.id)

                    }


                    schedule.sum('huorsNum', { where: { dailyWorkId: dailyWorkRecoed.id } })
                        .then(sum1 => {
                            dailyWork.update({ totalHours: sum1 + hours }, {
                                where: {
                                    id: dailyWorkRecoed.id
                                }
                            }).then(() => {
                                resolve(dailyWorkRecoed.id)

                            }).catch((err) => reject(err))

                        }).catch((err) => reject(err))

                }).catch((err) => reject(err))
        }
    )



let getDailyWork = (date1, date2) =>
    new Promise(
        (resolve, reject) => {

            dailyWork.findAll({
                where: {
                    date: {
                        between: [prepareDateOnly(date1), prepareDateOnly(date2)]
                    }
                },
                include: [
                    { model: schedule },
                ]
            }).then((result) => resolve(result))
                .catch((err) => reject(err))

        }
    )


let setEmployeeSchedule = (req, res, next) => {
    var newSchedule = req.body
    var employeeId = req.body.employeeId
    var daysNum = req.params.daysNum

    var currentTime = new Date()
    var newDate = currentTime.addDays(daysNum)




    checkEmployee(employeeId)
        .then(() => {

            newSchedule.id = createUuid()
            newSchedule.huorsNum = Hours(newSchedule.startTime, newSchedule.endTime)

            checkDailyWork(employeeId, newSchedule.startTime, newSchedule.huorsNum).then((deilyWorkId) =>

                prepareInput(newSchedule)
                    .then((employeeSchedule) => {
                        employeeSchedule.dailyWorkId = deilyWorkId
                        employeeSchedule.id = createUuid()
                        schedule.create(employeeSchedule)
                            .then((response) => {

                                getDailyWork(currentTime, newDate)
                                    .then((result) => dispatchSuc(res, result))
                                    .catch((err) => dispatchErr(res, err))




                            }).catch((err) => dispatchErr(res, err))
                    }).catch((err) => dispatchErr(res, err))


            )



        }).catch((err) => dispatchErr(res, err))

}

let getEmployeeSchedule = (req, res, next) => {
    //var query = req.query
    var daysNum = req.params.daysNum
    var huors = req.params.huorsNum
    var currentTime = new Date()
    let newDate = currentTime.addDays(daysNum)

    getDailyWork(currentTime, newDate)
        .then((result) => dispatchSuc(res, result))
        .catch((err) => dispatchErr(res, err))

}



module.exports = { setEmployeeSchedule, getEmployeeSchedule }
