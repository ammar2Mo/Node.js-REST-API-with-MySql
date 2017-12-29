'use strict'

module.exports = function (sequelize, DataTypes) {
    var schedule = sequelize.define('schedule', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        dailyWorkId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: true
        },
        endTime: {
            type: DataTypes.DATE,
            //primaryKey: true,
            allowNull: true
        },
        huorsNum: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
            freezeTableName: true,
            classMethods: {
                associate: function (models) {
                    // associations can be defined here
                    schedule.belongsTo(models.dailyWork, { foreignKey: 'dailyWorkId'})
                }
            }
        })
    return schedule
}
