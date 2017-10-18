'use strict'

module.exports = function (sequelize, DataTypes) {
    var usersPakeges = sequelize.define('usersPakeges', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        pakegeId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        consultentId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM,
            defaultValue: 'active',
            values: ['active', 'disActive']
        },
        expiry: {
            type: DataTypes.INTEGER(15),
            allawNull: false
        },
        date: {
            type: DataTypes.DATE,
            allawNull: false
        }
    }, {
            classMethods: {
                associate: function (models) {
                    // associations can be defined here // userPakeges
                    usersPakeges.belongsTo(models.pakeges, { foreignKey: 'pakegeId' })
                    usersPakeges.belongsTo(models.consultent, { foreignKey: 'consultentId' })


                }
            }
        })
    return usersPakeges
}
