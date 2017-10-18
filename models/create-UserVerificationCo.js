'use strict'

module.exports = function (sequelize, DataTypes) {
    var UserVerificationCo = sequelize.define('UserVerificationCo', {
        userId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        code: {
            type: DataTypes.STRING(4),
            primaryKey: true,
            allowNull: false
        },
        sentTo: {
            type: DataTypes.INTEGER(50),
            allowNull: false
        },
        sentAt: {
            type: DataTypes.INTEGER(30),
            allowNull: false
        }
    }, {
            freezeTableName: true,
            classMethods: {
                associate: function (models) {
                    // associations can be defined here
                }
            }
        })
    return UserVerificationCo
}
