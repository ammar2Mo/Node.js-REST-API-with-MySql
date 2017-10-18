'use strict'

module.exports = function (sequelize, DataTypes) {
    var consultation = sequelize.define('consultation', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        consultentId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        advisorId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: true
        },
        userpakegeId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM,
            defaultValue: 'pending',
            values: ['solved', 'pending','active']
        },
        timestamp: {
            type: DataTypes.STRING,
            defaultValue: new Date().getTime()
        }
    }, {
            classMethods: {
                associate: function (models) {
                    // associations can be defined here
                    consultation.belongsTo(models.Advisor, { foreignKey: 'advisorId' })
                    consultation.belongsTo(models.consultent, { foreignKey: 'consultentId' })
                    //
                    consultation.hasMany(models.messages, { foreignKey: 'consultationId' })



                }
            }
        })
    return consultation
}
