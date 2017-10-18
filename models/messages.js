'use strict'

module.exports = function (sequelize, DataTypes) {
    var messages = sequelize.define('messages', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        fromId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        toId: {
            type: DataTypes.UUID,
            allowNull: true
        },
        consultationId: {
            type: DataTypes.UUID,
            //primaryKey: true,
            allowNull: true
        },
        consultentComplaintsId :{
            type: DataTypes.UUID,
            //primaryKey: true,
            allowNull: true
        },
        body: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        attachments: {
            type: DataTypes.STRING,
            allowNull: true
        },
        timestamp: {
            type: DataTypes.INTEGER(15),
            defaultValue: new Date().getTime()
        }
    }, {
            freezeTableName: true,
            classMethods: {
                associate: function (models) {
                    // associations can be defined here
                    messages.belongsTo(models.consultation, { foreignKey: 'consultationId' })
                    messages.belongsTo(models.consultentComplaints, { foreignKey: 'consultentComplaintsId' })

                }
            }
        })
    return messages
}


