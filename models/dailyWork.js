'use strict'
var moment = require('moment')
module.exports = function (sequelize, DataTypes) {
    var dailyWork = sequelize.define('dailyWork', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        employeeId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        date: {
            type: DataTypes.DATEONLY,
            get: function () {
                return moment.utc(this.getDataValue('regDate')).format('YYYY-MM-DD');
            }
        },
        totalHours: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        isHollyDay: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
            freezeTableName: true,
            classMethods: {
                associate: function (models) {
                    // associations can be defined here
                    dailyWork.belongsTo(models.employee, { foreignKey: 'employeeId' })
                    dailyWork.hasMany(models.schedule, { foreignKey: 'dailyWorkId' })
                }
            }
        })
    return dailyWork
}
