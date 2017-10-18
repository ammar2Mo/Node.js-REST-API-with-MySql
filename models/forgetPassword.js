'use strict'

module.exports = function (sequelize, DataTypes) {
    var forgetPassword = sequelize.define('forgetPassword', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        code: {
            type: DataTypes.STRING(4),
            primaryKey: false,
            allowNull: false
        },
        sentTo: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        sentAt: {
            type: DataTypes.STRING(30),
            allowNull: false
        }
    }, {
            
            classMethods: {
                associate: function (models) {
                    // associations can be defined here
                }
            }
        })
    return forgetPassword
}

